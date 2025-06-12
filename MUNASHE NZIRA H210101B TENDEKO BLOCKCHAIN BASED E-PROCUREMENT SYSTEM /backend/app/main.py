from fastapi import FastAPI, WebSocketDisconnect, WebSocket
from app.routes import tender, enums, auth, categories, suppliers, procuring_entities, bid, email, contracts, payments, notifications, violations
from fastapi.middleware.cors import CORSMiddleware
from app.services.bidevaluation import setup_scheduler, scheduler
from typing import List, Dict
from pydantic import BaseModel
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           
    allow_credentials=True,        
    allow_methods=["*"],           
    allow_headers=["*"],            
)


app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(tender.router, prefix="/tenders", tags=["Tenders"])
app.include_router(enums.router, prefix="/enums", tags=["Enums"])
app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(procuring_entities.router, prefix="/procure", tags=["ProcuringEntities"])
app.include_router(suppliers.router, prefix="/suppliers", tags=["Suppliers"])
app.include_router(bid.router, prefix="/bids", tags=["Bids"])
app.include_router(email.router, prefix="/emails", tags=["Emails"])
app.include_router(contracts.router, prefix="/contracts", tags=["Contracts"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(violations.router, prefix="/violations", tags=["Violations"])

@app.on_event("startup")    
def startup_event():
    logging.info("Tender processing scheduler startup")
    setup_scheduler()


@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()
    logging.info("Tender processing scheduler shut down")

@app.get("/")
def root():
    return {"message": "Welcome to the Procurement System API"}


@app.websocket("/ws")
async def websocket_endpint(websocket: WebSocket):
    # Accept the connection from the client
    await websocket.accept()
    try:
        # Continuously listen for incoming messages
        while True:
            data = await websocket.receive_text()
            # Echo the received message back to the client
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        print("Client disconnected")


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

@app.websocket("/nots")
async def websocket_endpoint(
    websocket: WebSocket,
):

    await manager.connect(websocket, "test_id")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "test_id")