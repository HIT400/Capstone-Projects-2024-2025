import paypalrestsdk
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.schemas.db_config import Payment, PaymentStatus
from decouple import config
import logging

logger = logging.getLogger(__name__)

paypalrestsdk.configure({
    "mode": config("PAYPAL_MODE"),
    "client_id": config("PAYPAL_CLIENT_ID"),
    "client_secret": config("PAYPAL_CLIENT_SECRET")
})

class PayPalService:
    @staticmethod
    async def create_payment(
        amount: float, 
        db: Session, 
        user_id: int,
        tender_id: str,
        contract_id: str,
        currency: str = "USD",
        description: str = "Payment for services"
    ):
        """Create a PayPal payment and store it in the database."""
        try:

            formatted_amount = f"{amount:.2f}"
            
            payment = paypalrestsdk.Payment({
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": f"{config("PAYPAL_API_BASE_URL")}/payments/paypal/execute-payment?tender_id={tender_id}",
                    "cancel_url": f"{config("PAYPAL_API_BASE_URL")}/payments/paypal/cancel-payment"
                },
                "transactions": [{
                    "amount": {
                        "total": formatted_amount,
                        "currency": currency
                    },
                    "description": description
                }]
            })
            
            if not payment.create():
                logger.error(f"Failed to create PayPal payment: {payment.error}")
                raise HTTPException(
                    status_code=400, 
                    detail=f"Payment creation failed: {payment.error.get('message', 'Unknown error')}"
                )
            
            approval_url = next(
                link.href for link in payment.links if link.rel == "approval_url"
            )
            
            db_payment = Payment(
                id=payment.id,
                user_id=user_id,
                amount=float(formatted_amount),
                contract_id=contract_id,
                payment_method="PayPal",
                currency=currency,
                description=description,
                status=PaymentStatus.PENDING
            )
            
            db.add(db_payment)
            db.commit()
            
            return {
                "payment_id": payment.id,
                "approval_url": approval_url
            }
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Database error while creating payment: {str(e)}")
            raise HTTPException(status_code=500, detail="Database error occurred")
        except Exception as e:
            logger.error(f"Error creating payment: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Payment creation failed: {str(e)}")
    
    @staticmethod
    async def execute_payment(payment_id: str, payer_id: str, db: Session):
        """Execute a previously created PayPal payment."""
        try:
            db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
            if not db_payment:
                raise HTTPException(status_code=404, detail="Payment not found in database")
            
            payment = paypalrestsdk.Payment.find(payment_id)
            
            if not payment.execute({"payer_id": payer_id}):
                logger.error(f"Failed to execute PayPal payment: {payment.error}")
                
                db_payment.status = PaymentStatus.FAILED
                db.commit()
                
                raise HTTPException(
                    status_code=400, 
                    detail=f"Payment execution failed: {payment.error.get('message', 'Unknown error')}"
                )
            
            db_payment.status = PaymentStatus.COMPLETED
            db_payment.payer_id = payer_id
            db.commit()

            return 
            
        except paypalrestsdk.exceptions.ResourceNotFound:
            logger.error(f"Payment {payment_id} not found in PayPal")
            raise HTTPException(status_code=404, detail="Payment not found in PayPal")
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Database error while executing payment: {str(e)}")
            raise HTTPException(status_code=500, detail="Database error occurred")
        except Exception as e:
            logger.error(f"Error executing payment: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Payment execution failed: {str(e)}")
    
    @staticmethod
    async def cancel_payment(payment_id: str, db: Session):
        """Mark a payment as cancelled in the database."""
        try:
            db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
            if not db_payment:
                raise HTTPException(status_code=404, detail="Payment not found")
            
            db_payment.status = PaymentStatus.CANCELLED
            db.commit()
            
            return db_payment.to_dict()
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Database error while cancelling payment: {str(e)}")
            raise HTTPException(status_code=500, detail="Database error occurred")
