# Simulated in-memory consent store
# In production this would be a database

CONSENT_STORE = {}

DEFAULT_CONSENT = {
    "bank_data": False,
    "upi_data": False,
    "utility_bills": False,
    "gst_data": False,
    "location_data": False,
    "psychometric_data": False
}

DATA_DESCRIPTIONS = {
    "bank_data": {
        "label": "Bank Account Data",
        "description": "Salary credits, account balance, transaction history",
        "score_weight": "High Impact (+20% of score)",
        "icon": "🏦"
    },
    "upi_data": {
        "label": "UPI Transaction Data",
        "description": "Frequency and consistency of digital payments",
        "score_weight": "High Impact (+20% of score)",
        "icon": "📱"
    },
    "utility_bills": {
        "label": "Utility Bill Payments",
        "description": "Electricity, water, mobile recharge payment history",
        "score_weight": "High Impact (+20% of score)",
        "icon": "💡"
    },
    "gst_data": {
        "label": "GST Filing Data",
        "description": "For MSMEs — GST filing consistency and turnover",
        "score_weight": "Medium Impact (+15% of score)",
        "icon": "📊"
    },
    "location_data": {
        "label": "Location Stability",
        "description": "Residential and workplace stability over time",
        "score_weight": "Low Impact (+10% of score)",
        "icon": "📍"
    },
    "psychometric_data": {
        "label": "Psychometric Assessment",
        "description": "Financial discipline, risk attitude, planning behavior quiz",
        "score_weight": "Medium Impact (+15% of score)",
        "icon": "🧠"
    }
}

def get_consent(borrower_name: str) -> dict:
    name = borrower_name.lower()
    if name not in CONSENT_STORE:
        # First time - return default (all false)
        CONSENT_STORE[name] = DEFAULT_CONSENT.copy()

    consents = CONSENT_STORE[name]
    total_given = sum(1 for v in consents.values() if v)
    confidence = "High" if total_given >= 4 else "Medium" if total_given >= 2 else "Low"

    enriched = {}
    for key, value in consents.items():
        enriched[key] = {
            **DATA_DESCRIPTIONS[key],
            "consented": value
        }

    return {
        "borrower_name": borrower_name,
        "consents": enriched,
        "total_consented": total_given,
        "out_of": len(consents),
        "confidence_level": confidence,
        "message": "More data shared = Higher confidence score = Better loan offers"
    }

def update_consent(borrower_name: str, updates: dict) -> dict:
    name = borrower_name.lower()
    if name not in CONSENT_STORE:
        CONSENT_STORE[name] = DEFAULT_CONSENT.copy()

    for key, value in updates.items():
        if key in CONSENT_STORE[name]:
            CONSENT_STORE[name][key] = value

    return get_consent(borrower_name)

def revoke_all_consent(borrower_name: str) -> dict:
    name = borrower_name.lower()
    CONSENT_STORE[name] = DEFAULT_CONSENT.copy()
    return {
        "message": f"All consents revoked for {borrower_name}",
        "borrower_name": borrower_name,
        "consents_active": 0
    }