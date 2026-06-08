const BASE_URL = "https://udaanscore-api.onrender.com"

export const api = {
  // Borrower
  getRaju: () => 
    fetch(`${BASE_URL}/borrowers/Raju%20Sharma`).then(r => r.json()),

  getAllBorrowers: () => 
    fetch(`${BASE_URL}/borrowers/`).then(r => r.json()),

  // Trust Score
  calculateScore: (data: object) =>
    fetch(`${BASE_URL}/score/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // Features
  getNanoLadder: () =>
    fetch(`${BASE_URL}/features/nano-ladder/Raju%20Sharma`).then(r => r.json()),

  getCreditBuilder: () =>
    fetch(`${BASE_URL}/features/credit-builder/Raju%20Sharma`).then(r => r.json()),

  simulateScore: (data: object) =>
    fetch(`${BASE_URL}/features/simulate-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // Consent
  getConsent: () =>
    fetch(`${BASE_URL}/vault/consent/Raju%20Sharma`).then(r => r.json()),

  updateConsent: (data: object) =>
    fetch(`${BASE_URL}/vault/consent/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // Explainability
  explainScore: () =>
    fetch(`${BASE_URL}/vault/explain/Raju%20Sharma`).then(r => r.json()),

  // Lender
  getLenderReport: () =>
    fetch(`${BASE_URL}/lender/report/Raju%20Sharma`).then(r => r.json()),

  // Repay Loan
  repayLoan: (amount: number) =>
    fetch(`${BASE_URL}/borrowers/repay-loan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ borrower_name: "Raju Sharma", loan_amount: amount })
    }).then(r => r.json()),
}