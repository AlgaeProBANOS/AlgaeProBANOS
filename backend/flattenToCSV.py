import pandas as pd
import json

with open('datacopy/synonyms.json', 'r', encoding='utf-8') as f:
    synonyms = json.load(f)

# Convert to a flat list of rows, including the top-level key as a new column
rows = []
for species, entries in synonyms.items():
    for entry in entries:
        row = entry.copy()
        row['group'] = species  # add the top-level key as a column
        rows.append(row)

# Create DataFrame and export to CSV
df = pd.DataFrame(rows)
df.to_csv('synonyms.csv', index=False)

with open('datacopy/genus.json', 'r', encoding='utf-8') as f:
    genusObj = json.load(f)

# Convert to a flat list of rows, including the top-level key as a new column
rows = []
for genus, entries in genusObj.items():
    for entry in entries["children"]:
        row = entry.copy()
        row['group'] = genus  # add the top-level key as a column
        rows.append(row)

# Create DataFrame and export to CSV
df = pd.DataFrame(rows)
df.to_csv('genus.csv', index=False)

with open('datacopy/species.json', 'r', encoding='utf-8') as f:
    speciesObj = json.load(f)

# Convert to a flat list of rows, including the top-level key as a new column
rows = []
for species, entry in speciesObj.items():
    row = entry.copy()
    row['group'] = species  # add the top-level key as a column
    rows.append(row)

# Create DataFrame and export to CSV
df = pd.DataFrame(rows)
df.to_csv('species.csv', index=False)