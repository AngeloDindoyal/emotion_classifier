from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import tensorflow as tf
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production use
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="/code/app/static"), name="static")

templates = Jinja2Templates(directory="/code/app/templates") 

class ImageData(BaseModel):
    image: list[float]

@app.get("/")
def index(req: Request):
    return templates.TemplateResponse(
        name="index.html",
        context={"request": req}
    )

@app.post("/predict")
async def predict(data: ImageData):
    image_array = np.array(data.image, dtype=np.float32)
    image_array = image_array.reshape((1, 48, 48, 1))
    model = tf.keras.models.load_model("/code/app/fer_custom.h5")
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    result = model.predict(image_array)
    
    return {"prediction": result.tolist()}

if __name__ == "__main__": 
    uvicorn.run("main:app")
