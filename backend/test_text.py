import requests

url = "http://localhost:8000/api/analyze"
data = {'text': 'Pay ₹2000 registration fee', 'lang': 'en'}
response = requests.post(url, data=data)
print(response.status_code)
print(response.json())
