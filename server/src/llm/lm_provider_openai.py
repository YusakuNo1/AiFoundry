from langchain_core.language_models.base import BaseLanguageModel
from langchain_core.embeddings.embeddings import Embeddings
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from aif_types.llm import LlmProvider
from llm.lm_base_provider import LmBaseProvider, LmBaseProviderProps


class LmProviderOpenAI(LmBaseProvider):
    def __init__(self):
        super().__init__(LmBaseProviderProps(
            id="openai",
            name="OpenAI",
            llmProvider=LlmProvider.OPENAI,
            jsonFileName="model_info/openai_models.json",
            keyPrefix="OPENAI_",
            apiKeyDescription="Doc: https://platform.openai.com/docs/quickstart",
            apiKeyHint="",
        ))


    def _getBaseEmbeddingsModel(self, modelName: str, apiKey: str) -> Embeddings:
        return OpenAIEmbeddings(
            model=modelName,
            openai_api_key=apiKey,
        )


    def _getBaseLanguageModel(self, modelName: str, apiKey: str) -> BaseLanguageModel:
        return ChatOpenAI(
            model=modelName,
            openai_api_key=apiKey,
            temperature=0,
            streaming=True,
        )
