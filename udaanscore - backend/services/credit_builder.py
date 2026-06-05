def get_credit_builder(borrower: dict) -> dict:
    score = borrower["trust_score"]
    tasks = []

    # Generate tasks based on weak areas
    if borrower["bills_score"] < 75:
        tasks.append({
            "task": "Pay your next 2 utility bills on time",
            "score_impact": "+10 points",
            "category": "Bills"
        })

    if borrower["savings_score"] < 70:
        tasks.append({
            "task": "Maintain a minimum balance of ₹3,000 for 30 days",
            "score_impact": "+12 points",
            "category": "Savings"
        })

    if borrower["upi_score"] < 70:
        tasks.append({
            "task": "Make at least 10 UPI transactions this month",
            "score_impact": "+8 points",
            "category": "UPI Activity"
        })

    if borrower["quiz_score"] < 75:
        tasks.append({
            "task": "Complete the financial discipline assessment",
            "score_impact": "+15 points",
            "category": "Assessment"
        })

    if borrower["cashflow_score"] < 70:
        tasks.append({
            "task": "Avoid large cash withdrawals for 30 days",
            "score_impact": "+10 points",
            "category": "Cash Flow"
        })

    if borrower["location_score"] < 70:
        tasks.append({
            "task": "Maintain consistent location data for 2 weeks",
            "score_impact": "+5 points",
            "category": "Stability"
        })

    # Always add a general task
    tasks.append({
        "task": "Repay your current nano loan on time",
        "score_impact": "+15 to +60 points",
        "category": "Loan Repayment"
    })

    # Calculate potential score
    total_boost = sum([
        int(t["score_impact"].split("+")[1].split(" ")[0].split("to")[0].strip())
        for t in tasks
    ])
    predicted_score = min(score + total_boost, 980)

    # Determine next milestone
    if score < 600:
        milestone = 600
        milestone_label = "Reach Medium Risk band"
    elif score < 700:
        milestone = 700
        milestone_label = "Reach Low Risk band"
    elif score < 800:
        milestone = 800
        milestone_label = "Reach Very Low Risk band"
    else:
        milestone = 980
        milestone_label = "Achieve Maximum Trust Score"

    return {
        "borrower_name": borrower["name"],
        "current_score": score,
        "current_risk_band": borrower["risk_band"],
        "milestone_target": milestone,
        "milestone_label": milestone_label,
        "predicted_score_if_all_done": predicted_score,
        "tasks": tasks,
        "total_tasks": len(tasks),
        "estimated_days": 30
    }