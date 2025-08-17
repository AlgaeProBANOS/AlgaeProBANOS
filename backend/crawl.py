import pandas as pd
import json
from crawling.crawlAPI import query_species_taxonomy
from crawling.crawlGBIF import get_children, get_synonyms, query_occurrences, query_species, query_species_by_genus
import traceback


csv_file_path = 'testOutput.csv'
species = {}
genus = {}
synonyms = {}
dry = False
test = True

synonyms_key_filter = ["scientificName", "accepted", "acceptedKey", "genus", "species", "phylum", "key", "taxonomicStatus"]

occ_key_filter = ["decimalLatitude", "decimalLongitude", "basisOfRecord", "eventDate"]

def filter_syn_dict(entry):
    global synonyms_key_filter
    return {key: entry[key] for key in synonyms_key_filter if key in entry}

def filter_occ_dict(entry):
    global occ_key_filter
    return {key: entry[key] for key in occ_key_filter if key in entry}

try:
    df = pd.read_csv(csv_file_path, encoding='utf-8')
    print("CSV file loaded successfully.")

    for index, row in df.iterrows():
        if row["Scientific Name"] is None:
            continue
        if pd.isnull(row["Scientific Name"]):
            continue
        print(f'Processing {row["Scientific Name"]} ({index+1}/{len(df)})')
        print(f'\tSyns: {row["Synonyms"]}')
        if pd.isna(row["Species"]):
            genusKey = query_species_by_genus(row["Genus"], row["Division"])
            if genusKey != 'trySpeciesNames':
                print(genusKey)
                try:
                    children = get_children(genusKey)
                    genus[row["Scientific Name"]] = {"children": children}
                except Exception as e:
                    print("ERROR!")
                    print(e)
            else:
                print("Couldn't find the genus.")
        else:
            gbif_search = query_species(f'{row["Genus"]} {row["Species"]}')
            try:
                taxon_key = gbif_search['speciesKey']
            except:
                print("KeyError, printing out the obj instead:")
                print(gbif_search)

            print(f'Taxon: {taxon_key}')
            species[row["Scientific Name"]] = gbif_search

            syns = get_synonyms(taxon_key)
            synonyms[row["Scientific Name"]] = list(map(filter_syn_dict, syns))
            
            occs = query_occurrences(taxon_key, 200) if test == True else query_occurrences(taxon_key)
            print(f'Found {len(occs)} occurrences')
            if dry != True:
                print(f'Writing them out to data/{row["Scientific Name"].replace(" ", "_")}.json')
                with open(f'data/species/{row["Scientific Name"].replace(" ", "_")}.json', 'w') as f:
                    json.dump(list(map(filter_occ_dict, occs)), f)
                    f.close()

        if row["Scientific Name"].endswith(".") is False:
            print("Query API for taxonomy data")
            taxData = query_species_taxonomy(row["Scientific Name"])
            if row["Scientific Name"] in species:
                species[row["Scientific Name"]] = taxData | species[row["Scientific Name"]]
            else:
                species[row["Scientific Name"]] = taxData

        print()
        if dry != True:
            with open(f'data/species.json', 'w') as f:
                json.dump(species, f, indent=4)
                f.close()
        
            with open(f'data/genus.json', 'w') as f:
                json.dump(genus, f, indent=4)
                f.close()

            with open(f'data/synonyms.json', 'w') as f:
                json.dump(synonyms, f, indent=4)
                f.close()

    if dry != True:
        with open(f'data/species.json', 'w') as f:
            json.dump(species, f, indent=4)
            f.close()
    
        with open(f'data/genus.json', 'w') as f:
            json.dump(genus, f, indent=4)
            f.close()

        with open(f'data/synonyms.json', 'w') as f:
            json.dump(synonyms, f, indent=4)
            f.close()
        
except FileNotFoundError:
    print(f"Error: File not found at '{csv_file_path}'")
except pd.errors.EmptyDataError:
    print("Error: The CSV file is empty.")
except pd.errors.ParserError:
    print("Error: The CSV file is badly formatted.")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
    print(traceback.format_exc())
