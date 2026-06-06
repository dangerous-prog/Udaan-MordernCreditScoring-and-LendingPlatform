from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.consent_vault import get_consent, update_consent, revoke_all_consent
from services.explainability import explain_score
from services.fraud_detection import detect_fraud
from services.data_generator import BORROWERS_DB

router = APIRouter()

# ─── CONSENT VAULT ──────────────────────────────────────────────

@router.get("/consent/{borrower_name}")
def view_consent(borrower_name: str):
    return get_consent(borrower_name)


class ConsentUpdate(BaseModel):
    borrower_name: str
    bank_data: Optional[bool] = None
    upi_data: Optional[bool] = None
    utility_bills: Optional[bool] = None
    gst_data: Optional[bool] = None
    location_data: Optional[bool] = None
    psychometric_data: Optional[bool] = None


@router.post("/consent/update")
def update_user_consent(data: ConsentUpdate):
    updates = {}
    if data.bank_data is not None:
        updates["bank_data"] = data.bank_data
    if data.upi_data is not None:
        updates["upi_data"] = data.upi_data
    if data.utility_bills is not None:
        updates["utility_bills"] = data.utility_bills
    if data.gst_data is not None:
        updates["gst_data"] = data.gst_data
    if data.location_data is not None:
        updates["location_data"] = data.location_data
    if data.psychometric_data is not None:
        updates["psychometric_data"] = data.psychometric_data

    return update_consent(data.borrower_name, updates)


@router.delete("/consent/revoke/{borrower_name}")
def revoke_consent(borrower_name: str):
    return revoke_all_consent(borrower_name)


# ─── EXPLAINABILITY ─────────────────────────────────────────────

@router.get("/explain/{borrower_name}")
def explain_borrower_score(borrower_name: str):
    for borrower in BORROWERS_DB:
        if borrower["name"].lower() == borrower_name.lower():
            return explain_score(borrower)
    raise HTTPException(status_code=404, detail="Borrower not found")


# ─── FRAUD DETECTION ────────────────────────────────────────────

@router.get("/fraud-check/{borrower_name}")
def fraud_check(borrower_name: str):
    for borrower in BORROWERS_DB:
        if borrower["name"].lower() == borrower_name.lower():
            return detect_fraud(borrower)
    raise HTTPException(status_code=404, detail="Borrower not found")