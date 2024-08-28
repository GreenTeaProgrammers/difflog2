# https://docs.ultralytics.com/modes/predict/#inference-sources for more information

from ultralytics import YOLO

# imports for reading .env
import os
from dotenv import load_dotenv, dotenv_values 
# load .env file
load_dotenv() 

# model = YOLO('best.pt')
# model = YOLO('last.pt')
model = YOLO(os.getenv("TRAINED_MODEL"))

# Predict the model
model.predict(os.getenv("INPUT_IMAGE"), save=True)
