import requests
from datetime import date, timedelta
import json
import time
import math

GBIF_USERNAME = "vokabelsalat"
GBIF_PASSWORD = "rottU6-qowdex-kynkyp"
EMAIL = "kusnick@imada.sdu.dk"

all_taxon_keys = ["2663815", "5422592", "6539336", "7699695", "3219153", "10749950", "5716008", "3218096", "3218108", "3196524", "5279834", "3199064", "2638448", "9421491", "3197821", "2668875", "5272029", "2667664", "5279220", "2642878", "2643172", "5277182", "4275388", "2644592", "5270956", "5270961", "5279140", "8037811", "5279115", "3195749", "5422988", "5272770", "5272898", "3198562", "2667249", "5272096", "5272167", "3197970", "5276013", "2668944", "2661972", "5423614", "7847644", "5423480", "2667034", "5279349", "2687984", "3197450", "3199521", "2661869", "2668123", "2668108", "7465722", "3196291", "3196387", "3196387", "3196437", "3196369", "8222574", "2666910", "2663047", "2662801", "2662738", "2662702", "2662738", "2666168", "5278945", "5278820", "5278844", "5278909", "5278964", "5729951", "8087963", "2658889", "5271011", "5271011", "5422716", "2658992", "2665377", "3197836", "2665786", "9802728", "5276203", "11806849", "2666738", "5422479", "5422383", "5422378", "10470945", "7627628", "10749950", "2663537", "5422328", "2667316", "2667288", "8920944", "2668282", "2645215", "2645228", "3201507", "7658841", "4267628", "5421671", "2660045", "2659421", "2659435", "3200186", "7843860", "7563591", "3196499", "3197869", "3197920", "7716676", "2654944", "5278595", "8231752", "5275663", "5275740", "5275561", "5275705", "3195818", "2662919", "12238937", "7448593", "8304263", "7713874", "2643576", "2663303", "5422368", "4377207", "4377206", "5422611", "3196783", "3196917", "3197314", "3197125", "7711060", "11595049", "2665958", "5422803", "2645337", "10293666", "2688046", "9762244", "12104862", "5273394", "5273309", "5273454", "5273416", "5422556", "2660688"]

query_default = {
    "creator": GBIF_USERNAME,
    "notificationAddresses": [
        EMAIL
    ],
    "sendNotification": True,
    "format": "SIMPLE_CSV",
}

taxon_query_default = {
    "type": "in",
    "key": "TAXON_KEY",
    "values": []
}

bounds_query = {
    "type": "within",
    "geometry": "POLYGON((-26.942848249874004 31.43581990686755, 65.1077179732153 31.43581990686755, 65.1077179732153 73.33119246537285, -26.942848249874004 73.33119246537285, -26.942848249874004 31.43581990686755))"
}

year_query = {
    "type": "greaterThanOrEquals",
    "key": "YEAR",
    "value": "2005"
}

status_urls = {}

i = 0
step_size = math.ceil(len(all_taxon_keys) / 3)
while i < len(all_taxon_keys):
    print(i, i+step_size)
    
    taxon_query = {**taxon_query_default, 'values': list(all_taxon_keys[i:i+step_size])}
    print(f"Taxon Query: {taxon_query}")

    query = {**query_default, "predicate": {
        "type": "and",
        "predicates": [bounds_query, year_query, taxon_query]
    }}

    # 4. Send the download request
    response = requests.post(
        "https://api.gbif.org/v1/occurrence/download/request",
        auth=(GBIF_USERNAME, GBIF_PASSWORD),
        headers={"Content-Type": "application/json"},
        data=json.dumps(query)
    )

    if response.ok:
        download_key = response.text.strip()
        print("Download key:", download_key)
        # 5. Check status
        status_url = f"https://api.gbif.org/v1/occurrence/download/{download_key}"
        print(status_url)
        status_urls[status_url] = download_key
    else:
        print("Error submitting download:", response.status_code, response.text)
        break

    i+=step_size
    print()


while True:
    for url in status_urls:
        print(f"Checking {url}")
        status_response = requests.get(url)
        if not status_response.ok:
            print("Error checking status:", status_response.status_code)
            break

        status_json = status_response.json()
        status = status_json.get("status")

        print(f"Status: {status}")

        if status == "SUCCEEDED":
            print("✅ Download ready!")
            download_key = status_urls[url]
            # ---- Download ZIP ----
            if status == "SUCCEEDED":
                zip_url = f"https://api.gbif.org/v1/occurrence/download/request/{download_key}.zip"
                print("Downloading results...")

                with requests.get(zip_url, stream=True) as r:
                    r.raise_for_status()
                    with open(f"{download_key}.zip", "wb") as f:
                        for chunk in r.iter_content(chunk_size=8192):
                            f.write(chunk)

                print(f"✅ File saved as {download_key}.zip")
            break
        elif status in ("KILLED", "FAILED"):
            print("❌ Download failed or was cancelled.")
            break

    # Wait 10 seconds before checking again
    time.sleep(30)
    print()