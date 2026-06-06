from pydantic import BaseModel
from typing import Optional

class Borrower(BaseModel):
    id: int
    name: str
    age: int
    occupation: str
    city: str
    trust_score: int
    risk_band: str
    loan_limit: int
    confidence: str
    bills_score: float
    upi_score: float
    cashflow_score: float
    savings_score: float
    location_score: float
    quiz_score: float
    nano_loan_stage: int
    total_loans_repaid: int
    monthly_income: int

class RepayLoanInput(BaseModel):
    borrower_name: str
    loan_amount: int