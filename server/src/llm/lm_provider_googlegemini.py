from langchain_core.language_models.base import BaseLanguageModel
from langchain_core.embeddings.embeddings import Embeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from aif_types.llm import LlmProvider
from llm.lm_base_provider import LmBaseProvider, LmBaseProviderProps


class LmProviderGoogleGemini(LmBaseProvider):
    def __init__(self):
        super().__init__(LmBaseProviderProps(
            id="googlegemini",
            name="Google Gemini",
            llmProvider=LlmProvider.GOOGLEGEMINI,
            jsonFileName="model_info/googlegemini_models.json",
            keyPrefix="GOOGLE_GEMINI_",
            apiKeyDescription="Doc: https://ai.google.dev/gemini-api/docs/api-key",
            apiKeyHint="",
        ))


    def _getBaseEmbeddingsModel(self, modelName: str, apiKey: str) -> Embeddings:
        return GoogleGenerativeAIEmbeddings(
            model=modelName,
            google_api_key=apiKey,
        )


    def _getBaseLanguageModel(self, modelName: str, apiKey: str) -> BaseLanguageModel:
        return ChatGoogleGenerativeAI(
            model=modelName,
            google_api_key=apiKey,
            temperature=0,
            streaming=True,
        )
