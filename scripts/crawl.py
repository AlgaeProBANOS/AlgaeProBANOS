import json
import pandas as pd
import os.path

from crawlGBIF import query_species, query_occurrences

secondRunner = True

all_species = {}


with open("../public/data/species.json", "r") as f:
    all_species = json.load(f)

    species_keys = list(all_species.keys())
    species_keys.sort()

    i = 0
    while i < len(species_keys):
        specKey = species_keys[i]
        if os.path.isfile(f"occurrences/{specKey}.json"):
            print(f"{specKey} ({i+1}/{len(all_species)}) => SKIP")
            i = i + 1
            continue
        elif secondRunner and (i + 1 < len(species_keys)) and not os.path.isfile(f"occurrences/{species_keys[i+1]}.json"):
            secondRunner = False
            i = i + 1
            continue
            
        print(f"{specKey} ({i+1}/{len(all_species)})")
        if 'speciesKey' in all_species[specKey]:
            occs = query_occurrences(all_species[specKey]["speciesKey"])
            specFile = open(f"occurrences/{specKey}.json", "w")
            specFile.write(json.dumps(occs, indent=2).replace('NaN', 'null'))
            specFile.close()
        elif "scientificName" in all_species[specKey]:
            print(specKey)
            print("========== SEARCH! ==========")
            gbif_search = query_species(all_species[specKey]["scientificName"])
            if "speciesKey" in gbif_search:
                print("SPECIES")
                occs = query_occurrences(gbif_search["speciesKey"])
                specFile = open(f"occurrences/{specKey}.json", "w")
                specFile.write(json.dumps(occs, indent=2).replace('NaN', 'null'))
                specFile.close()
            
            if "rank" in gbif_search and gbif_search['rank'] == "GENUS":
                print("GENUS")
                print(gbif_search["genusKey"])
                occs = query_occurrences(gbif_search["genusKey"])
                specFile = open(f"occurrences/{specKey}.json", "w")
                specFile.write(json.dumps(occs, indent=2).replace('NaN', 'null'))
                specFile.close()
        else: 
            print(specKey)
            print("NOO!!!!")

        i = i + 1
        print()