import os
from typing import List, Callable
from urllib.parse import urlparse
from langchain_core.language_models.base import BaseLanguageModel
from langchain_core.embeddings.embeddings import Embeddings
from langchain_anthropic import ChatAnthropic
from aif_types.llm import LlmProvider
from llm.llm_tools_utils import create_tool
from llm.llm_uri_utils import AnthropicLmInfo, BaseLlmInfo, getUriParams
from llm.lm_base_provider import LmBaseProvider, LmBaseProviderProps


class LmProviderAnthropic(LmBaseProvider):
    def __init__(self):
        super().__init__(LmBaseProviderProps(
            id="anthropic",
            name="Anthropic Claude",
            llmProvider=LlmProvider.ANTHROPIC,
            jsonFileName="model_info/anthropic_models.json",
            keyPrefix="ANTHROPIC_",
            apiKeyDescription="Doc: https://console.anthropic.com/settings/keys",
            apiKeyHint="",
        ))


    def _getBaseEmbeddingsModel(self, modelName: str, apiKey: str) -> Embeddings:
        raise NotImplementedError("Embeddings are not supported by Anthropic Claude")


    def getBaseLanguageModel(self, aif_agent_uri: str, functions: List[Callable] = []) -> BaseLanguageModel:
        """
        This function is a bit special for Anthropic Claude, 2 major differences:
        1. In `tools`, the first level parameter `parameters` should be replaced with `input_schema`
        2. For `llm.bind`, the parameter is `tools=tools` instead of `functions=tools`
        """
        baseLlmInfo = self._parse_llm_uri(aif_agent_uri)
        api_key = os.environ.get(self.props.keyPrefix + "API_KEY")
        llm = self._getBaseLanguageModel(baseLlmInfo.model_name, api_key)

        if not functions or len(functions) == 0:
            return llm
        else:
            tools = [create_tool(func, "input_schema") for func in functions]
            # return llm.bind(functions=tools)
            return llm.bind(tools=tools)

    def _getBaseLanguageModel(self, modelName: str, apiKey: str) -> BaseLanguageModel:
        return ChatAnthropic(
            model=modelName,
            anthropic_api_key=apiKey,
            temperature=0,
            streaming=True,
        )
