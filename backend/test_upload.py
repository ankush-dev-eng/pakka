import requests
from io import BytesIO

url = "http://localhost:8000/api/analyze"
file_content = b"This is a test PDF content."

files = {'file': ('test.pdf', BytesIO(file_content), 'application/pdf')}
data = {'lang': 'en'}

response = requests.post(url, files=files, data=data)
print(response.status_code)
print(response.json())
