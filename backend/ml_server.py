from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/diff', methods=['POST'])
def calculate_diff():
    data = request.get_json()
    
    # ここでMLモデルによる解析を行う代わりに、適当な値を返します
    response = {
        "added": 3,
        "deleted": 1,
        "modified": 2
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)