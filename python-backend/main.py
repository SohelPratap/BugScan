from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router  # Make sure this is correct

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# Include the router
app.include_router(router)