from fastapi import APIRouter, Depends, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.services.paypal_services import PayPalService
from app.dependencies import get_db, get_current_user
from app.models.payment import PaymentCreate, PaymentResponse
from app.schemas.db_config import Payment
from typing import List
from decouple import config

router = APIRouter()

@router.post("/paypal/create-payment", response_model=dict)
async def create_paypal_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a PayPal payment and return the approval URL."""
    return await PayPalService.create_payment(
        amount=payment_data.amount,
        currency=payment_data.currency,
        contract_id=payment_data.contract_id,
        tender_id=payment_data.tender_id,
        description=payment_data.description,
        user_id=current_user.id,
        db=db
    )

@router.get("/paypal/execute-payment", response_model=PaymentResponse)
async def execute_paypal_payment(
    paymentId: str = Query(...),
    PayerID: str = Query(...),
    tender_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Execute a previously created PayPal payment."""
    await PayPalService.execute_payment(
        payment_id=paymentId,
        payer_id=PayerID,
        db=db
    )

    url =f"{config("FRONEND_ENDPOINT")}/procurers/tender/{tender_id}?tab=payments"

    return RedirectResponse(url=url)

@router.get("/paypal/cancel-payment")
async def cancel_paypal_payment(
    paymentId: str = Query(...),
    db: Session = Depends(get_db)
):
    """Cancel a PayPal payment."""
    return await PayPalService.cancel_payment(
        payment_id=paymentId,
        db=db
    )

@router.get("/user-payments", response_model=List[PaymentResponse])
async def get_user_payments(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all payments for the current user."""
    payments = db.query(Payment).filter(Payment.user_id == current_user.id).all()
    return [payment.to_dict() for payment in payments]


