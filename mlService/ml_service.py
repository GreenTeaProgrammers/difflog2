from flask import Flask, request, jsonify, make_response
from ultralytics import YOLO
import logging
import cv2
import numpy as np

app = Flask(__name__)

# ログの設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


labels_group = {
    'animal': [
        'bird',
        'cat',
        'dog',
        'horse',
        'sheep',
        'cow',
        'elephant',
        'bear',
        'zebra',
        'giraffe',
    ],
    'food': [
        'banana',
        'apple',
        'sandwich',
        'orange',
        'broccoli',
        'carrot',
        'hot_dog',
        'pizza',
        'donut',
        'cake',
    ],
    'home_appliance': [
        'microwave',
        'oven',
        'toaster',
        'sink',
        'refrigerator',
    ],
}

class Model:
    detection_image = None
    general_model = 'yolomodel' # 汎用的なモデルの名前
    expert_models = [ # エキスパートモデルが作られているlabelのnameのリスト
        'book',
    ] 
    
    def __init__(self, image_data):
        self.detection_image = self.decode_image(image_data)
        logger.info('Model initialized')
        
    def decode_image(self, image_data):
        """バイナリデータをデコードして画像として読み込む"""
        np_arr = np.frombuffer(image_data, np.uint8)
        return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
    def detect(self):
        results_dict = {}
        for trained_model in [self.general_model, *self.expert_models]:
            model = YOLO(f'{trained_model}.pt')
            results = model.predict(self.detection_image)
            logger.info(f'{trained_model} inference completed')
            
            results_dict[trained_model] = results
            
        return results_dict
    

@app.route('/detect', methods=['POST'])
def detect():
    try:
        image_data = request.data
        logger.info("Received data of length: %d", len(image_data))
        
        model = Model(image_data)
        results_dict = model.detect()
        
        object_counts = {}
        for model_name, results in results_dict.items():
            for result in results:
                
                if model_name in model.expert_models:
                    object_counts[model_name] = 0
                    
                for box in result.boxes:
                    class_id = int(box.cls)
                    class_name = result.names[class_id]
                    for group_name, group_labels in labels_group.items():
                        if class_name in group_labels:
                            class_name = group_name
                            break
                        
                    if class_name in object_counts:
                        object_counts[class_name] += 1
                    else:
                        object_counts[class_name] = 1
        
        
        logger.info("Object counts calculated: %s", object_counts)
        
        return make_response(jsonify(object_counts), 200)
    except Exception as e:
        logger.error(e)
        return make_response(jsonify({'error': str(e)}), 500)
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
