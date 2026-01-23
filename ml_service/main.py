import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Header, Request  # type: ignore[import]
from pydantic import BaseModel  # type: ignore[import]
from fastapi.middleware.cors import CORSMiddleware  # type: ignore[import]

ML_API_KEY = os.getenv("ML_API_KEY", "dev-key")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

app = FastAPI(title="AgriRent ML Service", version="1.0")

# Allow only the MERN backend to call the ML service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendationRequest(BaseModel):
    user_id: str
    user_role: str
    location: Optional[str] = None
    recent_activity: Optional[List[dict]] = []


class RecommendedItem(BaseModel):
    equipment_id: str
    score: float
    suggested_price: Optional[float] = None


class RecommendationResponse(BaseModel):
    recommendations: List[RecommendedItem]


class PricingRequest(BaseModel):
    equipment_id: str
    current_price: float
    region: Optional[str] = None
    utilization: Optional[float] = 0.0
    forecasted_demand: Optional[float] = 0.0


class PricingResponse(BaseModel):
    suggested_price: float
    adjustment_percentage: float
    reason: str


def check_api_key(x_api_key: str = Header(None)):
    if x_api_key != ML_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


@app.post("/api/v1/recommendations", response_model=RecommendationResponse)
async def recommendations(payload: RecommendationRequest, x_api_key: str = Header(None)):
    """
    Simple hybrid recommendation placeholder:
    - Uses recent_activity to seed recommendations
    - Returns top 5 equipment ids with mock scores
    """
    check_api_key(x_api_key)

    # Very simple deterministic mock logic for PoC
    base_ids = [
        "equip_1001",
        "equip_1002",
        "equip_1003",
        "equip_1004",
        "equip_1005",
        "equip_1006",
        "equip_1007",
    ]
    # Boost score if user has recent bookings
    boost = 0.2 if payload.recent_activity else 0.0
    recommendations = []
    for i, eid in enumerate(base_ids[:5]):
        score = round(0.9 - i * 0.12 + boost, 3)
        suggested_price = None
        if payload.user_role == "owner":
            suggested_price = round(1000 * (1 + (0.05 - i * 0.01)), 2)
        recommendations.append(RecommendedItem(equipment_id=eid, score=max(score, 0.01), suggested_price=suggested_price))

    return RecommendationResponse(recommendations=recommendations)


@app.post("/api/v1/pricing/suggest", response_model=PricingResponse)
async def pricing_suggest(payload: PricingRequest, x_api_key: str = Header(None)):
    """
    Simple rule-based pricing suggestion PoC:
    - If forecasted demand high -> increase price
    - If utilization low -> decrease price
    """
    check_api_key(x_api_key)

    demand = payload.forecasted_demand or 0.0
    util = payload.utilization or 0.0
    current = payload.current_price

    adjustment = 0.0
    reason_parts = []
    if demand > 0.7:
        adjustment += 0.10
        reason_parts.append("High forecasted demand")
    if util > 0.8:
        adjustment += 0.08
        reason_parts.append("High current utilization")
    if util < 0.2:
        adjustment -= 0.10
        reason_parts.append("Low utilization")

    suggested = round(current * (1 + adjustment), 2)
    return PricingResponse(
        suggested_price=max(1.0, suggested),
        adjustment_percentage=round(adjustment * 100, 2),
        reason="; ".join(reason_parts) or "Baseline suggestion"
    )


@app.post("/api/v1/forecast/run")
async def run_forecast(request: Request, x_api_key: str = Header(None)):
    """
    Trigger forecasting job (placeholder).
    In production this would run a batch job and store results in MongoDB.
    """
    check_api_key(x_api_key)
    # Placeholder: return simple status
    return {"status": "scheduled", "detail": "Forecast job scheduled (POC)"}