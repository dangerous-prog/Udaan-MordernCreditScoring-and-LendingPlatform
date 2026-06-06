from fastapi import APIRouter, HTTPException
from services.data_generator import BORROWERS_DB, get_risk_band, get_loan_limit
from services.explainability import explain_score
from services.fraud_detection import detect_fraud

router = APIRouter()

@router.get("/report/{borrower_name}")
def get_lender_report(borrower_name: str):
    """Full borrower report for banks and NBFCs"""
    for borrower in BORROWERS_DB:
        if borrower["name"].lower() == borrower_name.lower():
            explanation = explain_score(borrower)
            fraud = detect_fraud(borrower)

            return {
                "report_type": "UdaanScore Lender Report",
                "generated_for": "Banks / NBFCs",
                "privacy_note": "Personal identity masked — risk profile only",

                # Masked identity
                "borrower_profile": {
                    "age_group": f"{(borrower['age'] // 10) * 10}s",
                    "occupation_category": borrower["occupation"],
                    "city_tier": get_city_tier(borrower["city"]),
                    "monthly_income_range": get_income_range(borrower["monthly_income"])
                },

                # Core scores
                "trust_score": borrower["trust_score"],
                "risk_band": borrower["risk_band"],
                "confidence": borrower["confidence"],
                "recommended_loan_limit": borrower["loan_limit"],

                # Fraud check
                "fraud_assessment": {
                    "risk_level": fraud["risk_level"],
                    "verified": fraud["verified"],
                    "auto_approved": fraud["auto_approved"],
                    "flags": len(fraud["flags"])
                },

                # Explainability
                "score_strengths": explanation["positive_factors"],
                "score_weaknesses": explanation["negative_factors"],
                "score_breakdown": explanation["score_breakdown"],

                # Loan history
                "loans_repaid": borrower["total_loans_repaid"],
                "current_nano_stage": borrower["nano_loan_stage"],

                # Recommendation
                "lender_recommendation": get_recommendation(
                    borrower["trust_score"],
                    fraud["fraud_score"]
                )
            }

    raise HTTPException(status_code=404, detail="Borrower not found")


@router.get("/eligible-borrowers")
def get_eligible_borrowers(min_score: int = 600):
    """Returns all borrowers above a minimum trust score"""
    eligible = [
        {
            "name": b["name"],
            "trust_score": b["trust_score"],
            "risk_band": b["risk_band"],
            "loan_limit": b["loan_limit"],
            "occupation": b["occupation"],
            "city": b["city"]
        }
        for b in BORROWERS_DB
        if b["trust_score"] >= min_score
    ]
    eligible.sort(key=lambda x: x["trust_score"], reverse=True)

    return {
        "total_eligible": len(eligible),
        "min_score_filter": min_score,
        "borrowers": eligible
    }


# ─── HELPER FUNCTIONS ───────────────────────────────────────────

def get_city_tier(city: str) -> str:
    tier1 = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata"]
    tier2 = ["Pune", "Jaipur", "Lucknow", "Ahmedabad"]
    if city in tier1:
        return "Tier 1"
    elif city in tier2:
        return "Tier 2"
    return "Tier 3"

def get_income_range(income: int) -> str:
    if income < 15000:
        return "Below ₹15,000"
    elif income < 30000:
        return "₹15,000 - ₹30,000"
    elif income < 50000:
        return "₹30,000 - ₹50,000"
    else:
        return "Above ₹50,000"

def get_recommendation(score: int, fraud_score: int) -> str:
    if fraud_score >= 50:
        return "🚫 DO NOT APPROVE — Fraud risk too high"
    elif score >= 800 and fraud_score == 0:
        return "✅ AUTO APPROVE — Excellent profile, clean record"
    elif score >= 700:
        return "✅ APPROVE — Good profile with standard verification"
    elif score >= 600:
        return "⚠️ CONDITIONAL APPROVE — Request additional documents"
    elif score >= 500:
        return "🔴 HOLD — High risk, manual review required"
    else:
        return "🚫 REJECT — Score too low for loan eligibility"