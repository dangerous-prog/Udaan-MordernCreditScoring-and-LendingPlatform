def explain_score(borrower: dict) -> dict:
    score = borrower["trust_score"]
    positives = []
    negatives = []
    suggestions = []

    # Analyse each data point
    if borrower["bills_score"] >= 80:
        positives.append({
            "factor": "Utility Bills",
            "detail": "Bills paid consistently and on time",
            "impact": "Strong positive signal"
        })
    elif borrower["bills_score"] >= 60:
        suggestions.append({
            "factor": "Utility Bills",
            "detail": "Some missed bill payments detected",
            "action": "Pay all utility bills on time for next 2 months"
        })
    else:
        negatives.append({
            "factor": "Utility Bills",
            "detail": "Frequent missed or delayed bill payments",
            "impact": "Dragging score down significantly"
        })

    if borrower["upi_score"] >= 80:
        positives.append({
            "factor": "UPI Activity",
            "detail": "Regular and consistent digital transactions",
            "impact": "Shows active financial participation"
        })
    elif borrower["upi_score"] >= 60:
        suggestions.append({
            "factor": "UPI Activity",
            "detail": "UPI usage is moderate but irregular",
            "action": "Increase digital payment frequency"
        })
    else:
        negatives.append({
            "factor": "UPI Activity",
            "detail": "Very low or inconsistent UPI usage",
            "impact": "Limited digital footprint detected"
        })

    if borrower["cashflow_score"] >= 80:
        positives.append({
            "factor": "Cash Flow",
            "detail": "Stable and regular income detected",
            "impact": "Consistent income is a strong trust signal"
        })
    elif borrower["cashflow_score"] < 60:
        negatives.append({
            "factor": "Cash Flow",
            "detail": "Irregular or inconsistent income pattern",
            "impact": "Income instability increases lending risk"
        })

    if borrower["savings_score"] >= 75:
        positives.append({
            "factor": "Savings Pattern",
            "detail": "Maintains healthy account balance consistently",
            "impact": "Disciplined saving behaviour detected"
        })
    else:
        negatives.append({
            "factor": "Savings",
            "detail": "Low or no savings balance maintained",
            "impact": "No savings buffer reduces repayment confidence"
        })
        suggestions.append({
            "factor": "Savings",
            "detail": "Build emergency fund",
            "action": "Maintain minimum ₹3,000 balance for 30 days"
        })

    if borrower["location_score"] >= 80:
        positives.append({
            "factor": "Location Stability",
            "detail": "Long-term residential stability confirmed",
            "impact": "Stable address increases lender confidence"
        })
    else:
        suggestions.append({
            "factor": "Location Stability",
            "detail": "Frequent location changes detected",
            "action": "Maintain consistent residential address"
        })

    if borrower["quiz_score"] >= 80:
        positives.append({
            "factor": "Financial Discipline",
            "detail": "High score on psychometric assessment",
            "impact": "Strong financial planning mindset"
        })
    elif borrower["quiz_score"] < 60:
        negatives.append({
            "factor": "Financial Discipline",
            "detail": "Low psychometric quiz score",
            "impact": "May indicate poor financial planning habits"
        })
        suggestions.append({
            "factor": "Assessment",
            "detail": "Retake the financial discipline quiz",
            "action": "Complete the full psychometric assessment"
        })

    # Score interpretation
    if score >= 800:
        verdict = "Excellent — Highly creditworthy borrower"
        emoji = "🟢"
    elif score >= 700:
        verdict = "Good — Reliable borrower with minor risks"
        emoji = "🟡"
    elif score >= 600:
        verdict = "Fair — Moderate risk, limited loan eligibility"
        emoji = "🟠"
    elif score >= 500:
        verdict = "Poor — High risk, requires improvement"
        emoji = "🔴"
    else:
        verdict = "Very Poor — Not eligible for loans currently"
        emoji = "⛔"

    return {
        "borrower_name": borrower["name"],
        "trust_score": score,
        "verdict": verdict,
        "verdict_emoji": emoji,
        "risk_band": borrower["risk_band"],
        "positive_factors": positives,
        "negative_factors": negatives,
        "improvement_suggestions": suggestions,
        "score_breakdown": {
            "utility_bills": f"{borrower['bills_score']}/100 (weight: 20%)",
            "upi_activity": f"{borrower['upi_score']}/100 (weight: 20%)",
            "cash_flow": f"{borrower['cashflow_score']}/100 (weight: 20%)",
            "savings": f"{borrower['savings_score']}/100 (weight: 15%)",
            "location_stability": f"{borrower['location_score']}/100 (weight: 10%)",
            "psychometric": f"{borrower['quiz_score']}/100 (weight: 15%)"
        }
    }