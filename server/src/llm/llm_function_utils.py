import os
from fastapi import HTTPException
from utils.assets_utils import get_functions_asset_path


def build_local_function_uri(functions_path: str, functions_name: str) -> str:
    if not functions_name:
        raise HTTPException(status_code=400, detail="Function path and name are required")

    if functions_path:
        functions_path = _format_local_function_path(functions_path)
        return f"aif://function/local/{functions_path}/{functions_name}"
    else:
        return f"aif://function/local/{functions_name}"


def create_func_file(function_path: str, function_name: str):
    file_template = "def {}(location: str, unit: str = \"celsius\") -> str:\n".format(function_name) + \
                    '    """\n' + \
                    "    Get the current weather in a given location\n\n" + \
                    "    :param location: The city and state, e.g. San Francisco, CA\n" + \
                    "    :type location: str\n" + \
                    "    :param unit: The unit of temperature to return, either celsius or fahrenheit\n" + \
                    "    :type unit: str\n" + \
                    "    :return: The current weather in the given location\n" + \
                    '    """\n' + \
                    "    return \"The current weather in {} is 72 degrees {}\".format(location, unit)\n"

    # Project folder is only needed for local server
    functions_full_path = os.path.join(get_functions_asset_path(), function_path)
    if not os.path.exists(functions_full_path):
        os.makedirs(functions_full_path)

    new_path_with_file = os.path.join(functions_full_path, function_name + ".py")
    if not os.path.exists(new_path_with_file):
        with open(new_path_with_file, "w") as f:
            f.write(file_template)
    else:
        raise HTTPException(status_code=400, detail="Function already exists")


def delete_func_file(function_path: str, function_name: str):
    functions_full_path = os.path.join(get_functions_asset_path(), function_path)
    file_path = os.path.join(functions_full_path, function_name + ".py")
    if os.path.exists(file_path):
        os.remove(file_path)


# For Linux/Mac, the path should be ".folder1.folder2", which represents "/folder1/folder2/"
# For Windows, the path should be "c...folder1.folder2", which represents "c:\\folder1\folder2\"
def _format_local_function_path(functions_path: str) -> str:
    if ":\\" in functions_path:
        # For Windows
        functions_path.replace(":\\", "...")

    return functions_path.replace("/", ".").replace("\\", ".")
