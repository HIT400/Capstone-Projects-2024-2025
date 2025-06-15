from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import user, upload, refresh_token

# Initialize FastAPI app
app = FastAPI()

# Include routers
app.include_router(user.router)
app.include_router(upload.router)
app.include_router(refresh_token.router)

# middleware 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins, you can restrict this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
