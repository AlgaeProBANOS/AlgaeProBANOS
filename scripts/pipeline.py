import json
from convertCSVtoJSON import csv_to_json

crawl_data = False
merge_data = True
matrix_file = "./pipeline_data/Algae matrix_to share.csv"


if crawl_data:
    print(f"Starting crawling process orginating from {matrix_file}")

if merge_data:
    print(f"Starting merging process orginating from {matrix_file}")

    new_matrix_file = matrix_file
    if matrix_file.endswith(".csv"):
        new_matrix_file = matrix_file.replace(".csv", ".json")
        print(f"{matrix_file} is a .csv, so we convert it to .json: {new_matrix_file}")
        csv_to_json(matrix_file, new_matrix_file, "Species (Latin name)")

    matrix_data = None
    with open(new_matrix_file, 'r', encoding='utf-8') as f:
        matrix_data = json.load(f)
        f.close()

    print(matrix_data)