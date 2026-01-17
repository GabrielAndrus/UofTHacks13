from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints

app = FastAPI(
    title="Reality-to-Brick Pipeline",
    description="Transform 360° video into LEGO sets using Twelve Labs and Blackboard AI.",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routes
app.include_router(endpoints.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Reality-to-Brick Pipeline. Send a video to /process-video to begin."}