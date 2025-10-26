import h3
import json
import sys

poly = h3.LatLngPoly([
    (31.43581990686755, -26.942848249874004),
    (31.43581990686755, 65.1077179732153),
    (73.33119246537285, 65.1077179732153),
    (73.33119246537285, -26.942848249874004),
    (31.43581990686755, -26.942848249874004)
])

resolution = 3

hexCounts = None
try: 
    with open(f"../public/data/hexas_filtered_{resolution}.json", "r") as f:
        hexCounts = json.load(f)
except:
    pass

hexs = h3.h3shape_to_cells(poly, resolution)
size = h3.average_hexagon_area(resolution)
print(f"Average Hexagon Size: {size} sqkm")

geos = {"type": "FeatureCollection", "features": []}

minSize = 99999999999999
maxSize = 0

id = 0
for hex in hexs:
    if hexCounts is not None and id not in hexCounts:
        id = id + 1
        continue

    # print(hex)
    poly_coords = h3.cells_to_geo([hex])
    area = h3.cell_area(hex)
    poly = {"id": f"{id}", "properties": {"HexagonID": id, "Shape_Area": area}, "type": "Feature", "geometry":{"coordinates": poly_coords["coordinates"], "type": "Polygon"}}
    geos['features'].append(poly)
    id = id + 1

    if area < minSize:
        minSize = area
    if area > maxSize:
        maxSize = area

print(f"Max Size: {maxSize} sqkm")
print(f"Min Size: {minSize} sqkm")

if hexCounts is not None:
    resolution = f"{resolution}_filtered"

with open(f"../public/data/hexas_{resolution}.json", "w") as f:
    json.dump(geos, f, indent=2)
    print(f"Wrote everything into ../public/data/hexas_{resolution}.json")
