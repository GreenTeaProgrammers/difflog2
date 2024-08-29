from flask import Flask, request, jsonify
from ultralytics import YOLO
import logging
import os

app = Flask(__name__)

# ログの設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# YOLOv8モデルを読み込む
model = YOLO('./yolomodel.pt')
logger.info("YOLOv8 model loaded successfully")

@app.route('/diff', methods=['POST'])
def calculate_diff():
    try:
        data = request.get_json()
        logger.info("Received data: %s", data)

        # データから画像パスを取得
        image_url = data.get("image_url")
        if not image_url:
            logger.error("No image_url found in the request")
            return jsonify({"error": "No image_url provided"}), 400

        # フルパスに変換
        image_path = os.path.join(os.getcwd(), image_url.strip('/'))
        logger.info("Full image path: %s", image_path)

        if not os.path.exists(image_path):
            logger.error("File not found: %s", image_path)
            return jsonify({"error": "File not found"}), 404

        logger.info("Processing image: %s", image_path)
        
        # YOLOv8モデルで推論を行う
        results = model(image_path)
        logger.info("Model inference completed")

        # 検出されたオブジェクトの種類ごとの数をカウント
        object_counts = {}
        for result in results:
            for box in result.boxes:
                class_id = int(box.cls)
                class_name = result.names[class_id]
                if class_name in object_counts:
                    object_counts[class_name] += 1
                else:
                    object_counts[class_name] = 1

        logger.info("Object counts calculated: %s", object_counts)
        
        # 結果をレスポンスとして返す
        response = {
            "object_counts": object_counts
        }
        
        logger.info("Returning response")
        return jsonify(response)
    except Exception as e:
        logger.exception("An error occurred during processing")
        return jsonify({"error": "An internal error occurred"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
