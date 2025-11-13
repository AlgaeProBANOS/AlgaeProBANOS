import csv
import json

def csv_to_json(csv_file_path, json_file_path, key_column):
    with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
        reader = csv.DictReader(csv_file)
        data = {}
        for entry in list(reader):
            # print(entry)
            data[entry[key_column]] = entry
    
        with open(json_file_path, mode='w', encoding='utf-8') as json_file:
            json.dump(data, json_file, indent=4)

# if __name__ == "__main__":
#     csv_path = "companies-csv.csv"   # Replace with your CSV file name
#     json_path = "companies.json"  # Replace with your desired JSON file name
#     csv_to_json(csv_path, json_path)
#     print(f"Converted '{csv_path}' to '{json_path}' successfully.")
