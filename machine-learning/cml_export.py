from ultralytics import YOLO

# imports for reading .env
import os
from dotenv import load_dotenv, dotenv_values 
# load .env file
load_dotenv() 

# Export the model
model = YOLO(os.getenv("TRAINED_MODEL"))
model.export(format="coreml")
