import random

def detect_fraud(borrower: dict) -> dict:
    flags = []
    risk_level = "Clean"
    fraud_score = 0

    score = borrower["trust_score"]
    cashflow = borrower["cashflow_score"]
    savings = borrower["savings_score"]
    upi = borrower["upi_score"]
    income = borrower["monthly_income"]

    # Rule 1: Sudden large deposit (simulated)
    if income > 50000 and savings < 40:
        flags.append({
            "flag": "Sudden Large Deposit Detected",
            "detail": "High income reported but no savings history",
            "severity": "High",
            "icon": "⚠️"
        })
        fraud_score += 35

    # Rule 2: Round-number suspicious transactions
    if upi > 90 and cashflow < 50:
        flags.append({
            "flag": "Suspicious Round-Number Transactions",
            "detail": "High UPI activity but poor cash flow consistency",
            "severity": "Medium",
            "icon": "🔍"
        })
        fraud_score += 20

    # Rule 3: Score manipulation attempt
    if score > 800 and savings < 45 and cashflow < 50:
        flags.append({
            "flag": "Possible Score Manipulation",
            "detail": "High overall score inconsistent with individual metrics",
            "severity": "High",
            "icon": "🚨"
        })
        fraud_score += 40

    # Rule 4: Income vs spending mismatch
    if income < 15000 and upi > 85:
        flags.append({
            "flag": "Income-Spending Mismatch",
            "detail": "Transaction volume significantly exceeds declared income",
            "severity": "Medium",
            "icon": "⚠️"
        })
        fraud_score += 25

    # Rule 5: Location instability + high loan request
    if borrower["location_score"] < 50 and score > 700:
        flags.append({
            "flag": "Location Instability Risk",
            "detail": "Frequent address changes despite high credit score",
            "severity": "Low",
            "icon": "📍"
        })
        fraud_score += 10

    # Determine risk level
    if fraud_score >= 50:
        risk_level = "High Fraud Risk"
        recommendation = "Manual review required before loan approval"
        badge_color = "red"
    elif fraud_score >= 25:
        risk_level = "Moderate Fraud Risk"
        recommendation = "Additional verification documents required"
        badge_color = "orange"
    elif fraud_score > 0:
        risk_level = "Low Fraud Risk"
        recommendation = "Minor concerns — proceed with standard checks"
        badge_color = "yellow"
    else:
        risk_level = "Clean Profile"
        recommendation = "No suspicious activity detected — safe to proceed"
        badge_color = "green"

    return {
        "borrower_name": borrower["name"],
        "fraud_score": fraud_score,
        "risk_level": risk_level,
        "badge_color": badge_color,
        "recommendation": recommendation,
        "flags_detected": len(flags),
        "flags": flags,
        "verified": fraud_score < 25,
        "auto_approved": fraud_score == 0
    }