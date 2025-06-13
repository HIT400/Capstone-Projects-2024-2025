from fastapi import APIRouter, BackgroundTasks, HTTPException
from typing import Dict
from app.services.email import EmailService
from app.models.email import EmailSchema
from app.security import generate_reset_token
from pydantic import EmailStr

router = APIRouter()

def send_email_background(
    to_email: str,
    subject: str,
    body: str,
    is_html: bool = False
):
    """Background task for sending emails"""

    email_service = EmailService()
    email_service.send_email(to_email, subject, body, is_html)

@router.post("/send-email/")
async def send_email(
    email_data: EmailSchema,
    background_tasks: BackgroundTasks
) -> Dict[str, str]:
    """
    Send email endpoint
    """
    try:
        background_tasks.add_task(
            send_email_background,
            email_data.email,
            email_data.subject,
            email_data.body
        )
        
        return {"message": "Email sending initiated"}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process email request: {str(e)}"
        )

def get_password_reset_template(reset_link: str) -> str:
    return f"""
    <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password. Click the link below to proceed:</p>
            <p><a href="{reset_link}">Reset Password</a></p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
        </body>
    </html>
    """

@router.post("/forgot-password/")
async def forgot_password(
    email: EmailStr,
    background_tasks: BackgroundTasks
) -> Dict[str, str]:
    """
    Handle forgot password request
    """
    try:

        reset_token = generate_reset_token(email) 
        reset_link = f"https://yourapp.com/reset-password?token={reset_token}"
        
        # Get email template
        email_body = get_password_reset_template(reset_link)
        
        # Send email in background
        background_tasks.add_task(
            send_email_background,
            email,
            "Password Reset Request",
            email_body,
            is_html=True
        )
        
        return {"message": "Password reset instructions sent to your email"}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process password reset request: {str(e)}"
        )