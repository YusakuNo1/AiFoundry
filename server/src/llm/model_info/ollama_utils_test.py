from typing import Any, Dict, List
import pytest
from unittest.mock import MagicMock
from unittest.mock import patch
import requests_mock
from .ollama_utils import (
    health_check,
    get_local_model_map,
    download_model,
    list_models,
)
from aif_types.llm import LlmProvider


def test_health_check():
    with requests_mock.Mocker() as mock:
        mock.get("http://host.docker.internal:11434", status_code=200)
        result = health_check()
        assert result == True

    with requests_mock.Mocker() as mock:
        mock.get("http://host.docker.internal:11434", status_code=400)
        result = health_check()
        assert result == False


def test_get_local_model_map_failure():
    with requests_mock.Mocker() as mock:
        mock.get("http://host.docker.internal:11434/api/tags", status_code=400, text="Mock error")
        try:
            get_local_model_map()
        except Exception as e:
            assert str(e) == "Failed to get Ollama data from http://host.docker.internal:11434/api/tags"


def test_get_local_model_map_success():
    with requests_mock.Mocker() as mock:
        json = {
            "models": [{
                "model": "test_model1:latest",
                "name": "Test Model 1",
                "size": 12345,
                "modified_at": "2021-01-01T00:00:00Z",               
            }, {
                "model": "test_model2",
                "name": "Test Model 2",
                "size": 23456,
                "modified_at": "2021-01-01T00:00:00Z",               
            }]
        }
        mock.get("http://host.docker.internal:11434/api/tags", status_code=200, json=json)
        result = get_local_model_map()
        assert result["test_model1"].name == "Test Model 1" \
            and result["test_model1"].id == "test_model1" \
            and result["test_model1"].size == 12345 \
            and result["test_model1"].modified_at == "2021-01-01T00:00:00Z" \
            and result["test_model1"].version == None
        assert result["test_model2"].name == "Test Model 2" \
            and result["test_model2"].id == "test_model2" \
            and result["test_model2"].size == 23456 \
            and result["test_model2"].modified_at == "2021-01-01T00:00:00Z" \
            and result["test_model2"].version == None


def test_download_model():
    with requests_mock.Mocker() as mock:
        mock.post("http://host.docker.internal:11434/api/pull", status_code=200)
        result = download_model("test_model")
        assert result == True

    with requests_mock.Mocker() as mock:
        mock.post("http://host.docker.internal:11434/api/pull", status_code=400)
        result = download_model("test_model")
        assert result == False


# def describe_list_models_for_all():
#     @pytest.fixture(autouse=True)
#     def setup(monkeypatch):
#         import llm.model_info.ollama_utils

#         monkeypatch.setenv("OLLAMA_MODELS_DEFAULT_WEIGHT", "500")
#         monkeypatch.setenv("OLLAMA_MODELS_PRIORITY", "model3,model2")

#         mocked_data = [{
#             "title": "model1",
#             "description": "model 1 description",
#             "tags": [
#                 "tag1",
#                 "TAG2",
#                 "vision",
#             ],
#         }, {
#             "title": "model2",
#             "description": "model 2 description",
#             "tags": [
#                 "tag1",
#                 "TAG2",
#                 "vision",
#             ],
#         }, {
#             "title": "model3",
#             "description": "model 3 description",
#             "tags": [
#                 "tag1",
#                 "TAG2",
#                 "vision",
#             ],
#         }]

#         # # original_read_json_file = llm.model_info.ollama_utils._read_json_file
#         # # llm.model_info.ollama_utils._read_json_file = MagicMock()
#         # # llm.model_info.ollama_utils._read_json_file.return_value = mocked_data

#         # from unittest.mock import mock_open
#         # # Convert JSON mocked_data to string
#         # mocked_data_str = str(mocked_data).replace("'", '"')
#         # monkeypatch.patch("builtins.open", mock_open(read_data=mocked_data_str))

#         yield
#         # Cleanup        
#         # llm.model_info.ollama_utils._read_json_file = original_read_json_file

#     def test_use_all_models(monkeypatch):
#         # Generate code: Mock the return value from a function called _read_json_file, it's from the same file as list_models, the function _read_json_file is called inside list_models
#         return_value = [{
#             "title": "model1",
#             "description": "model 1 description",
#             "tags": [
#                 "tag1",
#                 "TAG2",
#                 "vision",
#             ],
#         }, {
#             "title": "model2",
#             "description": "model 2 description",
#             "tags": [
#                 "tag1",
#                 "TAG2",
#                 "vision",
#             ],
#         }, {
#             "title": "model3",
#             "description": "model 3 description",
#             "tags": [
#                 "tag1",
#                 "TAG2",
#                 "vision",
#             ],
#         }]
#         def mock_return():
#             mocked_data_str = str(return_value).replace("'", '"')
#             return mocked_data_str
#         monkeypatch.setattr("llm.model_info.ollama_utils._read_json_file", mock_return)
        


#         monkeypatch.setenv("OLLAMA_MODELS_PRIORITY", "")
#         result = list_models("all")
#         assert len(result) == 3
#         assert result[0].provider == LlmProvider.OLLAMA \
#             and result[0].name == "model1" \
#             and result[0].basemodel_uri == "ollama://model1" \
#             and result[0].ready == False \
#             and result[0].weight == 500
#         assert result[1].provider == LlmProvider.OLLAMA \
#             and result[1].name == "model2" \
#             and result[1].basemodel_uri == "ollama://model2" \
#             and result[1].ready == False \
#             and result[1].weight == 500
#         assert result[2].provider == LlmProvider.OLLAMA \
#             and result[2].name == "model3" \
#             and result[2].basemodel_uri == "ollama://model3" \
#             and result[2].ready == False \
#             and result[2].weight == 500

#     def test_use_only_priority_models(monkeypatch):
#         result = list_models("all")
#         assert len(result) == 2
#         assert result[0].provider == LlmProvider.OLLAMA \
#             and result[0].name == "model2" \
#             and result[0].basemodel_uri == "ollama://model2" \
#             and result[0].ready == False \
#             and result[0].weight == 501
#         assert result[1].provider == LlmProvider.OLLAMA \
#             and result[1].name == "model3" \
#             and result[1].basemodel_uri == "ollama://model3" \
#             and result[1].ready == False \
#             and result[1].weight == 502
