from flask import Flask, request, jsonify
from ultralytics import YOLO

app = Flask(__name__)

# YOLOv8モデルを読み込む
model = YOLO('path/to/your/model.mlmodel')

@app.route('/diff', methods=['POST'])
def calculate_diff():
    data = request.get_json()

    # データから画像パスを取得
    image_path = data.get("image_path")
    
    # YOLOv8モデルで推論を行う
    results = model(image_path)
    
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
    
    # 結果をレスポンスとして返す
    response = {
        "object_counts": object_counts
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
