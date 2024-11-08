import os

def test_detect_valid_image(client):
    """有効な画像を送信して /detect エンドポイントをテスト"""
    image_path = os.path.join(os.path.dirname(__file__), "test_image.jpg")
    with open(image_path, "rb") as image_file:
        image_data = image_file.read()
    
    response = client.post('/detect', 
                           data=image_data,
                           content_type='application/octet-stream')
    
    assert response.status_code == 200
    assert response.json == {"book":3,"cell phone":1,"keyboard":2,"laptop":1,"mouse":1,"remote":1}

def test_detect_invalid_data(client):
    """無効なデータを送信して /detect エンドポイントをテスト"""
    response = client.post('/detect', 
                           data=b'invalid data',
                           content_type='application/octet-stream')
    
    assert response.status_code == 500

def test_detect_missing_image(client):
    """画像データが欠落している場合の /detect エンドポイントをテスト"""
    response = client.post('/detect', 
                           data=b'',
                           content_type='application/octet-stream')
    
    assert response.status_code == 500
    
def test_detect_grouped_labels(client):
    """labels_groupに含まれているものが検出された時にグループ名がclass_nameになっているかをテスト"""
    image_path = os.path.join(os.path.dirname(__file__), "test_image_with_animal.jpg")
    with open(image_path, "rb") as image_file:
        image_data = image_file.read()
    
    response = client.post('/detect', 
                           data=image_data,
                           content_type='application/octet-stream')
    
    assert response.status_code == 200
    response_data = response.json
    
    # Assuming the test image contains 'dog'
    assert 'animal' in response_data
    assert 'dog' not in response_data
    assert response_data['animal'] > 0