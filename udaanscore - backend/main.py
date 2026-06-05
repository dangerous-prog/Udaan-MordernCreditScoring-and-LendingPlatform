from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import score
from routes import borrowers
from routes import features

app = FastAPI(title="UdaanScore API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the score route
app.include_router(score.router, prefix="/score", tags=["Trust Score"])
app.include_router(borrowers.router, prefix="/borrowers", tags=["Borrowers"])
app.include_router(features.router, prefix="/features", tags=["Features"])

@app.get("/")
def home():
    return {"message": "UdaanScore API Running"}

@app.get("/health")
def health():
    return {"status": "ok"}