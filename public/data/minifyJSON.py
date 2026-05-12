import json

# Read formatted JSON
with open('species.json', 'r') as f:
    data = json.load(f)

# Save as minified JSON
with open('species.min.json', 'w') as f:
    json.dump(data, f, separators=(',', ':'), ensure_ascii=False)