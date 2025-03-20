from fastapi import FastAPI
from api.routes import router  # Make sure this is correct

app = FastAPI()

# Include the router
app.include_router(router)