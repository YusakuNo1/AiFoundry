import requests
from aif_types.ollama import OllamaModelInfo
from llm.llm_uri_utils import remove_ollama_tag_latest
from server_config import serverConfig


def get_host() -> str:
    """
    Ollama is running in the host machine, however, we prefer host.docker.internal because we only recommend running the server within a Docker container.
    """
    return "http://localhost:11434" if serverConfig.useLocalServer else "http://host.docker.internal:11434"


def health_check() -> bool:
    url = f"{get_host()}"
    try:
        response = requests.get(url)
    except Exception:
        return False
    return response.status_code == 200


def get_local_model_map() -> dict[str, OllamaModelInfo]:
    url = f"{get_host()}/api/tags"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            json_response = response.json()
            ollama_model_info_map = {}
            for model_info_json in json_response["models"]:
                id = remove_ollama_tag_latest(model_info_json["model"])
                model_info = OllamaModelInfo(
                    name=model_info_json["name"],
                    id=id,
                    size=model_info_json["size"],
                    modified_at=model_info_json["modified_at"],
                    version=None
                )

                ollama_model_info_map[id] = model_info
            return ollama_model_info_map
        else:
            raise Exception(f"Failed to get Ollama data from {url}")
    except Exception as e:
        raise e


def download_model(model_name: str) -> bool:
    url = f"{get_host()}/api/pull"
    try:
        response = requests.post(url, json={ "model": model_name})
        return response.status_code == 200
    except Exception:
        return False
