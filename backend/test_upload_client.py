from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_file():
    # create a valid small png image
    import base64
    png_data = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=")
    response = client.post("/api/analyze", files={"file": ("test.png", png_data, "image/png")}, data={"lang": "en"})
    print(response.status_code)
    print(response.json())

if __name__ == "__main__":
    test_file()
