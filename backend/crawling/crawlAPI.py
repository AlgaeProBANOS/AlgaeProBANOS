import requests

BASE_URL = "http://127.0.0.1:5000/api"
# BASE_URL = "http://127.0.0.1:5000/api/taxonomy/Palmaria%20palmata"

def query_species_taxonomy(name):
    print("SENT")
    response = requests.get(f"{BASE_URL}/taxonomy/{name}")
    data = response.json()
    return data
