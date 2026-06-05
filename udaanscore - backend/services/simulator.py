from services.data_generator import get_risk_band, get_loan_limit, get_confidence

def simulate_score(borrower: dict, changes: dict) -> dict:
    """
    changes = {
        "pay_bills_on_time": True/False,
        "increase_savings": True/False,
        "increase_upi_transactions": True/False,
        "avoid_cash_withdrawals": True/False,
        "complete_assessment": True/False
    }
    """
    current_score = borrower["trust_score"]
    boosts = []
    total_boost = 0

    if changes.get("pay_bills_on_time"):
        b = 10
        total_boost += b
        boosts.append({"action": "Pay bills on time", "boost": f"+{b}"})

    if changes.get("increase_savings"):
        b = 12
        total_boost += b
        boosts.append({"action": "Maintain ₹3,000+ balance", "boost": f"+{b}"})

    if changes.get("increase_upi_transactions"):
        b = 8
        total_boost += b
        boosts.append({"action": "Increase UPI transactions", "boost": f"+{b}"})

    if changes.get("avoid_cash_withdrawals"):
        b = 10
        total_boost += b
        boosts.append({"action": "Avoid large cash withdrawals", "boost": f"+{b}"})

    if changes.get("complete_assessment"):
        b = 15
        total_boost += b
        boosts.append({"action": "Complete financial assessment", "boost": f"+{b}"})

    predicted_score = min(current_score + total_boost, 980)
    predicted_score = max(predicted_score, 300)

    current_limit = get_loan_limit(current_score)
    new_limit = get_loan_limit(predicted_score)
    limit_increase = new_limit - current_limit

    # Estimate interest rate improvement
    if predicted_score >= 800:
        interest_rate = "12% p.a."
    elif predicted_score >= 700:
        interest_rate = "16% p.a."
    elif predicted_score >= 600:
        interest_rate = "22% p.a."
    else:
        interest_rate = "28% p.a."

    # Approval probability
    if predicted_score >= 700:
        approval = "Very High (85%+)"
    elif predicted_score >= 600:
        approval = "Moderate (55-70%)"
    elif predicted_score >= 500:
        approval = "Low (25-40%)"
    else:
        approval = "Very Low (<15%)"

    return {
        "borrower_name": borrower["name"],
        "current_score": current_score,
        "current_risk_band": get_risk_band(current_score),
        "current_loan_limit": current_limit,
        "predicted_score": predicted_score,
        "predicted_risk_band": get_risk_band(predicted_score),
        "predicted_loan_limit": new_limit,
        "loan_limit_increase": limit_increase,
        "score_boost": total_boost,
        "interest_rate_after": interest_rate,
        "approval_probability": approval,
        "actions_selected": boosts,
        "estimated_days_to_achieve": 60
    }