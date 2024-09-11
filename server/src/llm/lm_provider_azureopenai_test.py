import pytest
import dotenv
from unittest import mock
from llm.lm_provider_azureopenai import LmProviderAzureOpenAI
from aif_types.languagemodels import UpdateLmProviderRequest


def describe_updateLmProviderProvider():
    def test_updateLmProviderProvider_AZURE_OPENAI_API_KEY():
        request = _create_empty_request()
        request.properties = { "AZURE_OPENAI_API_KEY": "mock_AZURE_OPENAI_API_KEY" }
        _run_updateLmProviderProvider(request, 'AZURE_OPENAI_API_KEY', 'mock_AZURE_OPENAI_API_KEY')

    def test_updateLmProviderProvider_AZURE_OPENAI_API_BASE():
        request = _create_empty_request()
        request.properties = { "AZURE_OPENAI_API_BASE": "mock_AZURE_OPENAI_API_BASE" }
        _run_updateLmProviderProvider(request, 'AZURE_OPENAI_API_BASE', 'mock_AZURE_OPENAI_API_BASE')

    def test_updateLmProviderProvider_AZURE_OPENAI_API_VERSION():
        request = _create_empty_request()
        request.properties = { "AZURE_OPENAI_API_VERSION": "mock_AZURE_OPENAI_API_VERSION" }
        _run_updateLmProviderProvider(request, 'AZURE_OPENAI_API_VERSION', 'mock_AZURE_OPENAI_API_VERSION')

    def test_updateLmProviderProvider_AZURE_OPENAI_MODELS_DEFAULT_WEIGHT():
        request = _create_empty_request()
        request.weight = 12345
        _run_updateLmProviderProvider(request, 'AZURE_OPENAI_MODELS_DEFAULT_WEIGHT', '12345')

    def test_updateLmProviderProvider_AZURE_OPENAI_MODELS_EMBEDDING():
        request = _create_empty_request()
        request.embeddingModels = ["embedding-01", "embedding-02"]
        _run_updateLmProviderProvider(request, 'AZURE_OPENAI_MODELS_EMBEDDING', 'embedding-01,embedding-02')

    def test_updateLmProviderProvider_AZURE_OPENAI_MODELS_CONVERSATIONAL():
        request = _create_empty_request()
        request.conversationalModels = ["conversational-01", "conversational-02"]
        _run_updateLmProviderProvider(request, 'AZURE_OPENAI_MODELS_CONVERSATIONAL', 'conversational-01,conversational-02')

    def test_updateLmProviderProvider_AZURE_OPENAI_MODELS_VISION():
        request = _create_empty_request()
        request.visionModels = ["vision-01", "vision-02"]
        _run_updateLmProviderProvider(request, 'AZURE_OPENAI_MODELS_VISION', 'vision-01,vision-02')

    def test_updateLmProviderProvider_AZURE_OPENAI_MODELS_TOOLS():
        request = _create_empty_request()
        request.toolsModels = ["tools-01", "tools-02"]
        _run_updateLmProviderProvider(request, 'AZURE_OPENAI_MODELS_TOOLS', 'tools-01,tools-02')


    def _create_empty_request():
        return UpdateLmProviderRequest(
            lmProviderId="azureopenai",
            properties=None,
            weight=None,
            embeddingModels=None,
            conversationalModels=None,
            visionModels=None,
            toolsModels=None,
        )

    def _run_updateLmProviderProvider(request: UpdateLmProviderRequest, key: str, value: str):
        provider = LmProviderAzureOpenAI()

        with mock.patch.object(dotenv, "find_dotenv") as mock_find_dotenv, mock.patch.object(dotenv, "set_key") as mock_set_key:
            mock_find_dotenv.return_value = ".env"
            provider.updateLmProvider(request=request)
            mock_find_dotenv.assert_called_once()
            mock_set_key.assert_has_calls([
                mock.call('.env', key, value, quote_mode='never'),
            ])
            mock_find_dotenv.reset_mock()
            mock_set_key.reset_mock()
