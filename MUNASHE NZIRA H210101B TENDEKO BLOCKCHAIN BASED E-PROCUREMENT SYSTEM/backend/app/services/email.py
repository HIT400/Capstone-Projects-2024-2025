from fastapi import HTTPException
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from decouple import config

SMTP_HOST = config('SMTP_HOST', default='smtp.gmail.com')
SMTP_PORT = config('SMTP_PORT', default=587, cast=int)
SMTP_USERNAME = config('SMTP_USERNAME')
SMTP_PASSWORD = config('SMTP_PASSWORD')
SMTP_FROM_EMAIL = config('SMTP_FROM_EMAIL')

class EmailService:
    def __init__(
        self
    ):
        self.smtp_host = SMTP_HOST
        self.smtp_port = SMTP_PORT
        self.smtp_username = SMTP_USERNAME
        self.smtp_password = SMTP_PASSWORD
        self.from_email = SMTP_FROM_EMAIL

    def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        is_html: bool = False
    ) -> bool:
        try:
            # Create message
            message = MIMEMultipart('alternative')
            message['Subject'] = subject
            message['From'] = self.from_email
            message['To'] = to_email

            # Add body
            content_type = 'html' if is_html else 'plain'
            message.attach(MIMEText(body, content_type))

            # Create SMTP connection
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(message)

            return True

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to send email: {str(e)}"
            )


