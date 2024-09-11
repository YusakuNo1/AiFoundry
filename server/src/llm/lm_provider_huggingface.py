import dotenv, os
from urllib.parse import urlparse
from langchain_core.language_models.base import BaseLanguageModel
from langchain_core.embeddings.embeddings import Embeddings
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint, HuggingFaceEmbeddings
from aif_types.llm import LlmProvider
from aif_types.languagemodels import UpdateLmProviderRequest
from llm.lm_base_provider import LmBaseProvider, LmBaseProviderProps
from llm.llm_uri_utils import BaseLlmInfo, getUriParams


class LmProviderHuggingFace(LmBaseProvider):
    def __init__(self):
        super().__init__(LmBaseProviderProps(
            id="huggingface",
            name="Hugging Face",
            description="HuggingFace models are running locally, which may take a few minutes to dowlnoad.",
            llmProvider=LlmProvider.HUGGINGFACE,
            keyPrefix="HUGGINGFACE_",
            apiKeyDescription="Doc: https://huggingface.co/settings/tokens",
            apiKeyHint="",
            supportUserDefinedModels=True,
        ))
        # For some reasons, LangChain failed to set the API key, use env var here
        os.environ["HUGGINGFACEHUB_API_TOKEN"] = os.getenv("HUGGINGFACE_API_KEY", "")


    def updateLmProvider(self, request: UpdateLmProviderRequest):
        super().updateLmProvider(request)

        dotenv_file = dotenv.find_dotenv()
        self._updateLmProviderIndexes(dotenv_file, request)


    def _getBaseEmbeddingsModel(self, modelName: str, apiKey: str) -> Embeddings:
        model_kwargs = {'device': 'cpu'}
        encode_kwargs = {'normalize_embeddings': False}
        return HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
        # return HuggingFaceEmbeddings(
        #     model_name=modelName,
        #     model_kwargs=model_kwargs,
        #     encode_kwargs=encode_kwargs
        # )


    def _getBaseLanguageModel(self, modelName: str, apiKey: str) -> BaseLanguageModel:
        llm = HuggingFaceEndpoint(
            # model_kwargs={"use_auth_token": apiKey},
            hf_hub_api_token=apiKey,
            repo_id=modelName,
            task="text-generation",
            # max_new_tokens=512,
            # do_sample=False,
            # repetition_penalty=1.03,
        )

        return ChatHuggingFace(
            llm=llm,
            temperature=0,
            streaming=True,
            huggingface_auth_token=apiKey,
        )


    def _parse_llm_uri(self, aif_uri: str) -> BaseLlmInfo:
        parsed_aif_model_uri = urlparse(aif_uri)
        uriParams = getUriParams(parsed_aif_model_uri)
        return BaseLlmInfo(
            provider=self.props.llmProvider,
            model_name=f"{parsed_aif_model_uri.netloc}{parsed_aif_model_uri.path}",
            api_version=uriParams.get("api-version"),
        )
