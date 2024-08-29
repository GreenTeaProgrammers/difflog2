from flask import Flask, request, jsonify
import torch
from ultralytics import YOLO

app = Flask(__name__)

# YOLOv8モデルを読み込む
model = YOLO('./yolomodel.pt')

@app.route('/diff', methods=['POST'])
def calculate_diff():
    data = request.get_json()

    # データから画像パスを取得
    image_path = data.get("image_path")
    
    # YOLOv8モデルで推論を行う
    results = model(image_path)
    
    # 検出されたオブジェクトの数を取得
    added = len(results[0].boxes)  # 検出されたボックス（オブジェクト）の数
    
    # 例として削除・変更の値を仮定
    deleted = 0  # 差分ロジックを実装する必要があります
    modified = 0  # 差分ロジックを実装する必要があります

    # 結果をレスポンスとして返す
    response = {
        "added": added,
        "deleted": deleted,
        "modified": modified
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
