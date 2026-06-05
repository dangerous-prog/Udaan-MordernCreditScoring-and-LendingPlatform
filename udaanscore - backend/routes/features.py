from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.data_generator import BORROWERS_DB
from services.credit_builder import get_credit_builder
from services.simulator import simulate_score

router = APIRouter()

# ─── NANO LOAN LADDER ───────────────────────────────────────────

NANO_LOAN_STAGES = [
    {
        "stage": 1,
        "loan_amount": 2000,
        "label": "Starter Nano Loan",
        "min_score_required": 400,
        "score_boost_on_repay": 15,
        "description": "Your first step into the credit world"
    },
    {
        "stage": 2,
        "loan_amount": 5000,
        "label": "Small Loan",
        "min_score_required": 500,
        "score_boost_on_repay": 25,
        "description": "Building trust with consistent repayment"
    },
    {
        "stage": 3,
        "loan_amount": 15000,
        "label": "Growth Loan",
        "min_score_required": 600,
        "score_boost_on_repay": 40,
        "description": "Expanding your financial capacity"
    },
    {
        "stage": 4,
        "loan_amount": 50000,
        "label": "Scale Loan",
        "min_score_required": 700,
        "score_boost_on_repay": 60,
        "description": "Full trust established — significant funding"
    }
]

@router.get("/nano-ladder/{borrower_name}")
def get_nano_ladder(borrower_name: str):
    borrower = None
    for b in BORROWERS_DB:
        if b["name"].lower() == borrower_name.lower():
            borrower = b
            break

    if not borrower:
        raise HTTPException(status_code=404, detail="Borrower not found")

    score = borrower["trust_score"]
    current_stage = borrower["nano_loan_stage"]

    stages_with_status = []
    for stage in NANO_LOAN_STAGES:
        status = "locked"
        if score >= stage["min_score_required"]:
            if stage["stage"] < current_stage:
                status = "completed"
            elif stage["stage"] == current_stage:
                status = "active"
            else:
                status = "unlocked"

        stages_with_status.append({**stage, "status": status})

    # Next stage info
    next_stage = None
    for stage in NANO_LOAN_STAGES:
        if stage["stage"] == current_stage + 1:
            score_needed = stage["min_score_required"] - score
            next_stage = {
                "stage": stage["stage"],
                "loan_amount": stage["loan_amount"],
                "score_needed": max(0, score_needed),
                "label": stage["label"]
            }
            break

    return {
        "borrower_name": borrower["name"],
        "trust_score": score,
        "current_stage": current_stage,
        "current_loan_limit": NANO_LOAN_STAGES[current_stage - 1]["loan_amount"],
        "ladder": stages_with_status,
        "next_unlock": next_stage
    }


# ─── CREDIT BUILDER JOURNEY ─────────────────────────────────────

@router.get("/credit-builder/{borrower_name}")
def get_credit_builder_journey(borrower_name: str):
    for borrower in BORROWERS_DB:
        if borrower["name"].lower() == borrower_name.lower():
            return get_credit_builder(borrower)

    raise HTTPException(status_code=404, detail="Borrower not found")


# ─── SCORE SIMULATOR ────────────────────────────────────────────

class SimulatorInput(BaseModel):
    borrower_name: str
    pay_bills_on_time: Optional[bool] = False
    increase_savings: Optional[bool] = False
    increase_upi_transactions: Optional[bool] = False
    avoid_cash_withdrawals: Optional[bool] = False
    complete_assessment: Optional[bool] = False

@router.post("/simulate-score")
def simulate(data: SimulatorInput):
    for borrower in BORROWERS_DB:
        if borrower["name"].lower() == data.borrower_name.lower():
            changes = {
                "pay_bills_on_time": data.pay_bills_on_time,
                "increase_savings": data.increase_savings,
                "increase_upi_transactions": data.increase_upi_transactions,
                "avoid_cash_withdrawals": data.avoid_cash_withdrawals,
                "complete_assessment": data.complete_assessment
            }
            return simulate_score(borrower, changes)

    raise HTTPException(status_code=404, detail="Borrower not found")