from ultralytics import YOLO

# imports for reading .env
import os
from dotenv import load_dotenv, dotenv_values 
# load .env file
load_dotenv() 

# model = YOLO('yolov8n.pt')
model = YOLO(os.getenv("TRAINED_MODEL"))

results = model.train(
    # data='datasets/book-seg.v3i.yolov8-obb/data.yaml', 
    # epochs=3, 
    # imgsz=640, 
    # device='cpu' # Train with CPU(Option for windows without GPU)
    data=os.getenv("DATA_FILE"), 
    epochs=int(os.getenv("EPOCHS")), 
    imgsz=os.getenv("IMAGE_SIZE"), 
    device=int(os.getenv("DEVICE"))
)
