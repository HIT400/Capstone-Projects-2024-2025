from fastapi import APIRouter, WebSocket, Depends, HTTPException, status, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import uuid
import json
from pydantic import BaseModel
from app.dependencies import get_websocket_user, get_current_user, verify_token
from app.schemas.db_config import UserRole, User

router = APIRouter()


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            # Clean up empty lists
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
    
    async def send_notification(self, user_id: str, notification: dict):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_json(notification)

manager = ConnectionManager()

# Pydantic models
class NotificationCreate(BaseModel):
    title: str
    message: str
    user_id: str

class NotificationDB(BaseModel):
    id: str
    title: str
    message: str
    read: bool
    timestamp: str
    user_id: str

@router.websocket("/")
async def websocket_endpoint(
    websocket: WebSocket,
):
    # token = websocket.query_params.get("token")
    # payload = verify_token(token)
    
    # await manager.connect(websocket, user.id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "user.id")

# Endpoint to send a notification to a specific user
@router.post("/send", response_model=NotificationDB)
async def send_notification(notification: NotificationCreate):
    # Create notification object
    new_notification = {
        "id": str(uuid.uuid4()),
        "title": notification.title,
        "message": notification.message,
        "read": False,
        "timestamp": datetime.now().isoformat(),
        "user_id": notification.user_id
    }
    
    # Store notification in database
    # This is where you'd add code to store in your database
    # db_notification = models.Notification(**new_notification)
    # db.add(db_notification)
    # db.commit()
    
    # Send real-time notification via WebSocket
    await manager.send_notification(notification.user_id, new_notification)
    
    return new_notification

# Get all notifications for a user
@router.get("/", response_model=List[NotificationDB])
def get_notifications( user: User = Depends(get_current_user)):

    mock_notifications = [
        {
            "id": "1",
            "title": "New Tender",
            "message": "A new tender matching your profile has been posted.",
            "read": False,
            "timestamp": "2025-05-05T10:30:00Z",
            "user_id": user.id
        },
        {
            "id": "2",
            "title": "Bid Update",
            "message": "Your bid status has been updated.",
            "read": False,
            "timestamp": "2025-05-04T16:22:00Z",
            "user_id": user.id
        }
    ]
    
    return mock_notifications

# Mark notification as read
@router.post("/{notification_id}/read")
def mark_notification_read(notification_id: str):
    # Update in database
    # notification = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    # if not notification:
    #     raise HTTPException(status_code=404, detail="Notification not found")
    # notification.read = True
    # db.commit()
    
    return {"status": "success"}

# Mark all notifications as read for a user
@router.post("/mark-all-read")
def mark_all_notifications_read(user: User = Depends(get_current_user)):
    # Update in database
    # db.query(models.Notification).filter(
    #     models.Notification.user_id == user_id,
    #     models.Notification.read == False
    # ).update({"read": True})
    # db.commit()
    
    return {"status": "success"}