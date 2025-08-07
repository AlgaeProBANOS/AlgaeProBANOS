import requests

BASE_URL = "http://api.gbif.org/v1"

def query_species(name):
    response = requests.get(f"{BASE_URL}/species/match", params={"name": name})
    data = response.json()
    if data.get("confidence", 0) > 80:
        return data
    return None

def query_occurrences(taxon_key, i_limit=None):
    results = []
    limit = 300 if i_limit == None else i_limit
    offset = 0
    
    # [sw.lng, sw.lat, ne.lng, ne.lat]
    # [-26.942848249874004, 31.43581990686755, 65.1077179732153, 73.33119246537285]

    while True:
        response = requests.get(f"{BASE_URL}/occurrence/search", params={
            "taxonKey": taxon_key,
            "limit": limit,
            "offset": offset,
            "decimalLatitude": "31.43581990686755,73.33119246537285",
            "decimalLongitude": "-26.942848249874004,65.1077179732153"
        })
        print(response.url)
        data = response.json()
        results.extend(data.get("results", []))

        if data.get("endOfRecords") or len(data.get("results", [])) == 0 or (i_limit is not None and len(results) >= i_limit):
            break

        offset += limit

    return results

def query_species_by_genus(genus, phylum=""):
    response = requests.get(f"{BASE_URL}/species/match", params={"genus": genus, "phylum": phylum})
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
    results = []
    limit = 300

    while True:
        response = requests.get(f"{BASE_URL}/species/{genus_key}/children", params={"limit": limit, "offset": offset})
        data = response.json()
        results.extend(data.get("results", []))

        if data.get("endOfRecords") or len(data.get("results", [])) == 0:
            break

        offset += limit

    return results


def get_synonyms(taxon_key):
    response = requests.get(f"{BASE_URL}/species/{taxon_key}/synonyms", params={"limit": 1000})
    try:
        data = response.json()
        return data.get("results", [])
    except Exception:
        return []
