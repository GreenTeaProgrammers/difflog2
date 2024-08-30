from flask import Flask, request, jsonify
from ultralytics import YOLO
import os
import logging

app = Flask(__name__)

# ログの設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# YOLOv8モデルを読み込む
model = YOLO('./yolomodel.pt')
logger.info("YOLOv8 model loaded successfully")

# このデモのための前の状態を仮に作成 (実際にはデータベースなどから取得)
previous_object_counts = {
    'mouse': 1,
    'tv': 2,
    'laptop': 1
}

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

        # 正しいパスになるように修正
        base_path = os.path.join(os.getcwd(), '../captureService/uploads')
        image_path = os.path.join(base_path, os.path.basename(image_url))
        logger.info("Full image path: %s", image_path)

        if not os.path.exists(image_path):
            logger.error("File not found: %s", image_path)
            return jsonify({"error": "File not found"}), 404

        logger.info("Processing image: %s", image_path)
        
        # YOLOv8モデルで推論を行う
        results = model(image_path)
        logger.info("Model inference completed")

        # 検出されたオブジェクトの種類ごとの数をカウント
        current_object_counts = {}
        for result in results:
            for box in result.boxes:
                class_id = int(box.cls)
                class_name = result.names[class_id]
                if class_name in current_object_counts:
                    current_object_counts[class_name] += 1
                else:
                    current_object_counts[class_name] = 1

        logger.info("Object counts calculated: %s", current_object_counts)

        # 変更点を検出
        added, deleted, modified = 0, 0, 0
        changes = []

        for item, count in current_object_counts.items():
            previous_count = previous_object_counts.get(item, 0)
            if count > previous_count:
                added += count - previous_count
                changes.append({
                    "itemId": item,
                    "itemName": item,
                    "changeType": "added",
                    "previousCount": previous_count,
                    "currentCount": count
                })
            elif count < previous_count:
                deleted += previous_count - count
                changes.append({
                    "itemId": item,
                    "itemName": item,
                    "changeType": "deleted",
                    "previousCount": previous_count,
                    "currentCount": count
                })
            elif count == previous_count and count > 0:
                modified += count
                changes.append({
                    "itemId": item,
                    "itemName": item,
                    "changeType": "modified",
                    "previousCount": previous_count,
                    "currentCount": count
                })

        for item, count in previous_object_counts.items():
            if item not in current_object_counts:
                deleted += count
                changes.append({
                    "itemId": item,
                    "itemName": item,
                    "changeType": "deleted",
                    "previousCount": count,
                    "currentCount": 0
                })

        # 結果をレスポンスとして返す
        response = {
            "added": added,
            "deleted": deleted,
            "modified": modified,
            "changes": changes
        }

        logger.info("Returning response with changes: %s", response)
        return jsonify(response)

    except Exception as e:
        logger.exception("An error occurred during processing")
        return jsonify({"error": "An internal error occurred"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
