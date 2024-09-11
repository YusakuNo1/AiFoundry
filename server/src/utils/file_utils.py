import os, json

def read_json_file(path: str, json_file_name: str):
    json_file = os.path.join(path, json_file_name)
    with open(json_file, "r") as file:
        data = file.read()
    return json.loads(data)
