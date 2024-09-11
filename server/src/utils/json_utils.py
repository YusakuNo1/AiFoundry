from typing import List, Any

def convertListToDict(list: List[Any], key: str):
    """
    Convert an array of dictionaries to a dictionary of dictionaries
    """
    return { item[key]: item for item in list }
