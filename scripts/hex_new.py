import geopandas as gpd
import pandas as pd
from shapely.geometry import Point
import sys
import json

resolution = 3

# 1) Hex grid
hex_gdf = gpd.read_file(f"../public/data/hexas_{resolution}.json")  # must have a unique hex id column, e.g. 'hex_id'

orig_df1 = pd.read_csv("species_occs_1.csv", sep="\t")
orig_df2 = pd.read_csv("species_occs_2.csv", sep="\t")
orig_df3 = pd.read_csv("species_occs_3.csv", sep="\t")

orig_df = pd.concat([orig_df1, orig_df2, orig_df3])

print(hex_gdf)

filteredHexas = []

def hex_hex(species):
    global hex_gdf
    global orig_df
    global filteredHexas
    print(f"Hexing {species}")

    df = orig_df[orig_df['verbatimScientificName'] == species]

    pts = gpd.GeoDataFrame(
        df,
        geometry=[Point(xy) for xy in zip(df["decimalLongitude"], df["decimalLatitude"])],
        crs="EPSG:4326"  # GBIF coords are in WGS84
    )

    # 3) Align CRS with the hex grid
    # If your hex grid is in a projected CRS (common for equal-area hexes), project points to it.
    if hex_gdf.crs is None:
        # If your file missed the CRS, set it explicitly to what it should be
        # hex_gdf = hex_gdf.set_crs("EPSG:xxxx")
        raise ValueError("Hex grid has no CRS. Set hex_gdf.crs before joining.")

    pts = pts.to_crs(hex_gdf.crs)

    # 4) Spatial join: assign each point to a hex cell
    # 'within' is typical for point-in-polygon; 'intersects' is fine too.
    joined = gpd.sjoin(pts, hex_gdf[["HexagonID", "geometry"]], how="left", predicate="within")

    # 5) Aggregate counts per hex
    counts = (
        joined.groupby("HexagonID")
            .size()
            .rename("n")
            .reset_index()
    )

    hex_with_counts = hex_gdf.merge(counts, on="HexagonID", how="left").fillna({"n": 0})
    hex_with_counts["n"] = hex_with_counts["n"].astype(int)

    # Save or use in plotting
    # hex_with_counts.to_file("hex_counts.geojson", driver="GeoJSON")

    # Keep only hexagons with at least one occurrence
    hex_nonempty = hex_with_counts[hex_with_counts["n"] > 0].copy()

    # Optional: reset the index
    hex_nonempty.reset_index(drop=True, inplace=True)

    filteredHexas.extend(hex_nonempty["HexagonID"].to_list())
    filteredHexas = list(set(filteredHexas))

    # (optional) Save to GeoJSON if you want
    # hex_nonempty.to_file("hex_nonempty.geojson", driver="GeoJSON")

    return dict(zip(counts["HexagonID"].astype(str), counts["n"].astype(int)))

with open("../public/data/species.json", "r") as f:
    all_species = json.load(f)

results = {}

for specKey in all_species:
    results[specKey] = hex_hex(specKey)
    
print(results)

# Save to a JSON file
with open(f"../public/data/hex_counts_{resolution}.json", "w") as f:
    json.dump(results, f, indent=2)
    f.close()

with open(f"../public/data/hexas_filtered_{resolution}.json", "w") as f:
    json.dump(filteredHexas, f, indent=2)
    f.close()
