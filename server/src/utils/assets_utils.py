import os
from os.path import expanduser
from consts import AIFOUNDRY_LOCAL_SERVER_FOLDER_NAME, ASSETS_FOLDER_NAME, EMBEDDINGS_FOLDER_NAME, FUNCTIONS_FOLDER_NAME
from server_config import serverConfig


def get_assets_path() -> str:
    projectFolder = AIFOUNDRY_LOCAL_SERVER_FOLDER_NAME if serverConfig.useLocalServer else ""
    return os.path.join(expanduser("~"), projectFolder, ASSETS_FOLDER_NAME)


def get_functions_asset_path() -> str:
    return os.path.join(get_assets_path(), FUNCTIONS_FOLDER_NAME)


def get_embeddings_asset_path() -> str:
    return os.path.join(get_assets_path(), EMBEDDINGS_FOLDER_NAME)
