import requests
import time
import os
import random
import json

BASE_URL = "http://api.gbif.org/v1"

def query_species(name):
    response = requests.get(f"{BASE_URL}/species/match", params={"name": name})
    data = response.json()
    if data.get("confidence", 0) > 80:
        return data
    return None

# def query_occurrences(taxon_key):
#     results = []
#     offset = 0
#     limit = 300

#     while True:
#         response = requests.get(f"{BASE_URL}/occurrence/search", params={
#             "taxonKey": taxon_key,
#             "limit": limit,
#             "offset": offset
#         })
#         data = response.json()
#         results.extend(data.get("results", []))

#         if data.get("endOfRecords") or len(data.get("results", [])) == 0:
#             return results

#         offset += limit

#     return results

def query_occurrences(taxon_key):
    results = []
    offset = 0
    limit = 300

    while True:
        if os.path.isfile(f"temp/{taxon_key}_{offset}.json"):
            with open(f"temp/{taxon_key}_{offset}.json", "r") as f:
                print(f"Found temp file {f}")
                results.extend(json.load(f))
                offset += limit
                continue

        if offset + limit > 100000:
            return results

        response = requests.get(
            f"{BASE_URL}/occurrence/search",
            params={
                "taxonKey": taxon_key,
                "limit": limit,
                "offset": offset,
                "hasCoordinate": True,
                "gbifRegion": ["EUROPE"]
            }
        )
        print(response.url)
        response.raise_for_status()
        data = response.json()

        batch = data.get("results", [])
        results.extend(batch)

        # Check if we've reached the end
        if data.get("endOfRecords") or not batch:
            break

        print(f"{len(results)}/{data['count']} ({len(results)/data['count']*100}%)")

        tempFile = open(f"temp/{taxon_key}_{offset}.json", "w")
        tempFile.write(json.dumps(batch, indent=2).replace('NaN', 'null'))
        tempFile.close()

        offset += limit

        # Wait random amount of milliseconds before the next request
        time.sleep(random.randrange(1, 300, 1)/100)

    return results

def query_species_by_genus(genus):
    response = requests.get(f"{BASE_URL}/species/match", params={"genus": genus})
    data = response.json()
    return data.get("genusKey", "trySpeciesNames")

def get_genus_key_by_species_name(genus):
    response = requests.get(f"{BASE_URL}/species", params={"name": genus})
    data = response.json()

    for entry in sorted(data.get("results", []), key=lambda x: int(x.get("numDescendants", 0)), reverse=True):
        if entry.get("rank") == "GENUS" and entry.get("canonicalName") == genus:
            return entry.get("genusKey")
    return None

def get_children(genus_key, offset=0):
    response = requests.get(f"{BASE_URL}/species/{genus_key}/children", params={"limit": 1000, "offset": offset})
    data = response.json()
    return {
        "data": data.get("results", []),
        "endOfRecords": data.get("endOfRecords")
    }

def get_synonyms(taxon_key):
    response = requests.get(f"{BASE_URL}/species/{taxon_key}/synonyms", params={"limit": 1000})
    try:
        data = response.json()
        return data.get("results", [])
    except Exception:
        return []
