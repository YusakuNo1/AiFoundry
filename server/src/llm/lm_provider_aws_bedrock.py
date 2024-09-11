import dotenv, os
from typing import Dict
from langchain_core.language_models.base import BaseLanguageModel
from langchain_core.embeddings.embeddings import Embeddings
from langchain_aws import ChatBedrock, BedrockEmbeddings
from aif_types.languagemodels import LmProviderInfo, LmProviderProperty, UpdateLmProviderRequest
from aif_types.llm import LlmProvider
from llm.lm_base_provider import LmBaseProvider, LmBaseProviderProps


AWS_FOLDER = "~/.aws/"
AWS_CREDENTIALS_FILE = f"{AWS_FOLDER}credentials"
AWS_CONFIG_FILE = f"{AWS_FOLDER}config"


class LmProviderAwsBedrock(LmBaseProvider):
    def __init__(self):
        super().__init__(LmBaseProviderProps(
            id="aws-bedrock",
            name="AWS Bedrock",
            llmProvider=LlmProvider.AWS_BEDROCK,
            keyPrefix="AWS_BEDROCK_",
            apiKeyDescription="Doc: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html",
            apiKeyHint="",
            supportUserDefinedModels=True,
        ))


    def isHealthy(self) -> bool:
        return os.path.exists(os.path.expanduser(AWS_CREDENTIALS_FILE))


    def getLanguageProviderInfo(self) -> LmProviderInfo:
        region = ""
        if os.path.exists(os.path.expanduser(AWS_CONFIG_FILE)):
            with open(os.path.expanduser(AWS_CONFIG_FILE), "r") as f:
                lines = f.readlines()
                for line in lines:
                    if line.startswith("region"):
                        region = line.split("=")[1].strip()
                        break

        properties: dict[str, LmProviderProperty] = {
            "AWS_ACCESS_KEY_ID": {
                "description": self.props.apiKeyDescription,
                "hint": self.props.apiKeyHint,
                "value": "*****",
                "isCredential": True,
            },
            "AWS_SECRET_ACCESS_KEY": {
                "description": "",
                "hint": "",
                "value": "*****",
                "isCredential": True,
            },
            "AWS_SESSION_TOKEN": {
                "description": "",
                "hint": "",
                "value": "*****",
                "isCredential": True,
            },
            "region": {
                "description": "",
                "hint": "<us-east-1>",
                "value": region,
                "isCredential": False,
            },
        }

        models = self._getModelsFromIndexes()

        return LmProviderInfo(
            lmProviderId=self.getId(),
            name=self.getName(),
            properties=properties,
            weight=os.environ.get(self.props.keyPrefix + "MODELS_DEFAULT_WEIGHT"),
            supportUserDefinedModels=self.props.supportUserDefinedModels,
            models=models,
        )


    def updateLmProvider(self, request: UpdateLmProviderRequest):
        """
        Example of credentials file:

[default]
aws_access_key_id=foo
aws_secret_access_key=bar
aws_session_token=baz
        """

        """
        Example of config file:
[default]
region = us-east-1
output = json
        """
        super().updateLmProvider(request)

        dotenv_file = dotenv.find_dotenv()
        self._updateLmProviderIndexes(dotenv_file, request)

        if request.properties:
            if ("AWS_ACCESS_KEY_ID") in request.properties and "AWS_SECRET_ACCESS_KEY" in request.properties:
                aws_access_key_id = request.properties["AWS_ACCESS_KEY_ID"]
                aws_secret_access_key = request.properties["AWS_SECRET_ACCESS_KEY"]
                aws_session_token = request.properties.get("AWS_SESSION_TOKEN", "")

                os.makedirs(os.path.expanduser(AWS_FOLDER), exist_ok=True)
                if not os.path.exists(os.path.expanduser(AWS_CREDENTIALS_FILE)):
                    with open(os.path.expanduser(AWS_CREDENTIALS_FILE), "w") as f:
                        f.write(f"[default]\naws_access_key_id={aws_access_key_id}\naws_secret_access_key={aws_secret_access_key}\naws_session_token={aws_session_token}\n")
                else:
                    self._replaceLines(AWS_CREDENTIALS_FILE, {"aws_access_key_id": aws_access_key_id, "aws_secret_access_key": aws_secret_access_key, "aws_session_token": aws_session_token})

            if ("region") in request.properties:
                region = request.properties["region"]
                if not os.path.exists(os.path.expanduser(AWS_CONFIG_FILE)):
                    with open(os.path.expanduser(AWS_CONFIG_FILE), "w") as f:
                        f.write(f"[default]\nregion = {region}\noutput = json\n")
                else:
                    self._replaceLines(AWS_CONFIG_FILE, {"region": region})


    def _replaceLines(self, file_path: str, contentMap: Dict[str, str]):
        with open(os.path.expanduser(file_path), "r") as f:
            lines = f.readlines()
        with open(os.path.expanduser(file_path), "w") as f:
            for line in lines:
                for key, value in contentMap.items():
                    if line.startswith(key):
                        f.write(f"{key}={value}\n")
                    else:
                        f.write(line)


    def _getBaseEmbeddingsModel(self, modelName: str, apiKey: str) -> Embeddings:
        return BedrockEmbeddings(
            model_id=modelName,
        )


    def _getBaseLanguageModel(self, modelName: str, apiKey: str) -> BaseLanguageModel:
        return ChatBedrock(
            model_id=modelName,
            model_kwargs=dict(temperature=0),
            # temperature=0,
            # streaming=True,
        )
