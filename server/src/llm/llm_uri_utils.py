from enum import Enum
from urllib.parse import urlparse
from aif_types.llm import LlmProvider


class BaseLlmInfo:
	def __init__(self, provider: LlmProvider, model_name: str, api_version: str | None):
		self.provider = provider
		self.model_name = model_name
		self.api_version = api_version

class AzureOpenaiLlmInfo(BaseLlmInfo):
	def __init__(self, deployment_name: str, api_version: str | None):
		BaseLlmInfo.__init__(self, LlmProvider.AZUREOPENAI, model_name=deployment_name, api_version=api_version)

class OpenaiLlmInfo(BaseLlmInfo):
	def __init__(self, model_name: str, api_version: str | None):
		BaseLlmInfo.__init__(self, LlmProvider.OPENAI, model_name, api_version)

class OllamaLlmInfo(BaseLlmInfo):
	def __init__(self, model_name: str):
		BaseLlmInfo.__init__(self, LlmProvider.OLLAMA, model_name=model_name)

class GoogleGeminiLmInfo(BaseLlmInfo):
	def __init__(self, model_name: str, api_version: str | None):
		BaseLlmInfo.__init__(self, LlmProvider.GOOGLEGEMINI, model_name=model_name, api_version=api_version)

class AnthropicLmInfo(BaseLlmInfo):
	def __init__(self, model_name: str, api_version: str | None):
		BaseLlmInfo.__init__(self, LlmProvider.ANTHROPIC, model_name=model_name, api_version=api_version)


def create_llm_uri(provider: LlmProvider, model_name: str, api_version: str | None = None) -> str:
	if provider == LlmProvider.OPENAI:
		return f"openai://{model_name}?api-version={api_version}"
	elif provider == LlmProvider.AZUREOPENAI:
		return f"azureopenai://{model_name}?api-version={api_version}"
	elif provider == LlmProvider.OLLAMA:
		return f"ollama://{model_name}"
	elif provider == LlmProvider.GOOGLEGEMINI:
		return f"googlegemini://{model_name}"

	raise Exception("Invalid provider")


def remove_ollama_tag_latest(model_name: str) -> str:
    # Remove the ":latest" tag from the model name
	if model_name.endswith(":latest"):
		return model_name[:-7]
	else:
		return model_name


def getUriParams(model_uri):
	if not model_uri.query:
		return {}
	else:
		return dict([param.split("=") for param in model_uri.query.split("&")])
