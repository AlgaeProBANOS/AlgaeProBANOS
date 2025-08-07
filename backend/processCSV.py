import pandas as pd

csv_file_path = 'Algae matrix_to share_v3.csv'

try:
    df = pd.read_csv(csv_file_path, encoding='utf-8')
    print("CSV file loaded successfully.")

    # Replace and strip of weird things
    # iterating over the columns
    for i in df.columns:
        # checking datatype of each columns
        if df[i].dtype == 'object':
            # replacing and stripping
            df[i] = df[i].str.replace('"', '')
            df[i] = df[i].str.replace('  ', ' ')
            df[i] = df[i].str.replace('crreams', 'creams')
            df[i] = df[i].str.replace('Ausria', 'Austria')
            df[i] = df[i].str.replace('irish', 'Irish')
            df[i] = df[i].str.replace('ireland', 'Ireland')
            df[i] = df[i].str.replace('portugal', 'Portugal')
            df[i] = df[i].str.replace('umamami', 'umami')
            df[i] = df[i].str.strip()
        else:
            print("ELSE", df[i].dtype)
            # if condn. is False then it will do nothing.
            pass

    # Create a genus and species column in addition to the scientific name which was called species (latin name) so far
    df = df.rename(columns={"Species (Latin name)": "Scientific Name"})
    df["Synonyms"] = df["Scientific Name"].str.split("/").str[1:].str.join(",")
    df["Scientific Name"] = df["Scientific Name"].str.split("/").str[0]
    df["Genus"] = df["Scientific Name"].str.split().str[0]
    df["Species"] = df["Scientific Name"].str.split().str[1:].str.join(" ")
    df["Species"] = df["Species"].replace(["sp.", "spp."], "")

    df.to_csv(path_or_buf="./testOutput.csv", sep=",")

except FileNotFoundError:
    print(f"Error: File not found at '{csv_file_path}'")
except pd.errors.EmptyDataError:
    print("Error: The CSV file is empty.")
except pd.errors.ParserError:
    print("Error: The CSV file is badly formatted.")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
