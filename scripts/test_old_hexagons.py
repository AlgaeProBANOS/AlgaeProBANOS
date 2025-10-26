import json

def get_min_max_from_geojson(file_path, property_name):
    # Read GeoJSON file
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    values = []

    # Loop through all features (polygons)
    for feature in data.get("features", []):
        props = feature.get("properties", {})
        value = props.get(property_name)
        if isinstance(value, (int, float)):  # Only use numeric values
            values.append(value)

    if not values:
        print(f"No numeric values found for property '{property_name}'.")
        return

    print(f"Min {property_name}: {min(values)}")
    print(f"Max {property_name}: {max(values)}")

# Example usage:
# Replace 'your_file.geojson' with your filename and 'population' with your property name
get_min_max_from_geojson('hexagon_2_Project.json', 'Shape_Area')

