import { types } from 'aifoundry-vscode-shared';
import ILmProvider from "./ILmProvider";



// class LmBaseProviderProps(BaseModel):
//     id: str
//     name: str
//     description: str | None = None          # Shown in the provider configuration page
//     llmProvider: LlmProvider                # Maybe it can be deprecated?
//     jsonFileName: str | None = None
//     keyPrefix: str                          # Prefix for the provider, e.g. "OPENAI_"
//     apiKeyDescription: str | None = None    # Description for the API key
//     apiKeyHint: str | None = None           # Hint for the API key
//     supportUserDefinedModels: bool = False  # Whether the provider supports user-defined models

abstract class LmBaseProvider implements ILmProvider {
    private _id: string;
    private _name: string;
    private _description: string | null;
    // private _llmProvider: types.api.LlmProvider;
    private _jsonFileName: string | null;
    private _keyPrefix: string;
    private _apiKeyDescription: string | null;
    private _apiKeyHint: string | null;
    private _supportUserDefinedModels: boolean;

    public constructor(
        id: string,
        name: string,
        description: string | null,
        // llmProvider: types.api.LlmProvider,
        jsonFileName: string | null,
        keyPrefix: string,
        apiKeyDescription: string | null,
        apiKeyHint: string | null,
        supportUserDefinedModels: boolean
    ) {
        this._id = id;
        this._name = name;
        this._description = description;
        // this._llmProvider = llmProvider;
        this._jsonFileName = jsonFileName;
        this._keyPrefix = keyPrefix;
        this._apiKeyDescription = apiKeyDescription;
        this._apiKeyHint = apiKeyHint;
        this._supportUserDefinedModels = supportUserDefinedModels;
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get isHealthy(): boolean {
        // TODO: Implement
        throw new Error("Method not implemented.");
    }

    public getLmProviderStatus(): types.api.LmProviderInfo {
        return {
            lmProviderId: this.id,
            name: this.name,
            properties: {},
            weight: 0,
            supportUserDefinedModels: false,
            models: [],
            status: this.isHealthy ? "available" : "unavailable",        
        };
    }

    public canHandle(aifUri: string): boolean {
        return aifUri.startsWith(`${this.id}://`)
    }

    public listLanguageModels(feature: types.api.LlmFeature): types.api.LanguageModelInfo[] {
        if (this.jsonFileName) {
            return this._listLanguageModelsFromFile(feature);
        } else {
            // return this._listLanguageModelsFromIndexes(feature);
            return {} as any;
        }
    }

    private _listLanguageModelsFromFile(feature: types.api.LlmFeature): types.api.LanguageModelInfo[] {
        const modelCatalogItems = require(`./${this.jsonFileName}`);
        const modelCatalogItemDict = modelCatalogItems.reduce((acc: Record<string, any>, item: any) => {
            acc[item.title] = item;
            return acc;
        }, {});
        return {} as any;
    }


//         default_weight = os.environ.get(self.props.keyPrefix + "MODELS_DEFAULT_WEIGHT")
//         modelInfoList: List[LanguageModelInfo] = []
//         models_str = os.environ.get(self.props.keyPrefix + "SELECTED_MODELS")
//         if models_str is not None and len(models_str) > 0:
//             model_names = models_str.split(",")
//             for model_name in model_names:
//                 if model_name not in modelCatalogItemDict:
//                     continue

//                 modelCatalogItem = modelCatalogItemDict[model_name]
//                 modelCatalogItemTags = modelCatalogItem["tags"]

//                 if feature == LlmFeature.VISION and LlmFeature.VISION.value not in modelCatalogItemTags:
//                     continue

//                 if feature == LlmFeature.EMBEDDING and LlmFeature.EMBEDDING.value not in modelCatalogItemTags:
//                     continue

//                 if feature == LlmFeature.TOOLS and LlmFeature.TOOLS.value not in modelCatalogItemTags:
//                     continue

//                 if feature == LlmFeature.CONVERSATIONAL and LlmFeature.EMBEDDING.value in modelCatalogItemTags:
//                     # Non-embedding models are conversational
//                     continue

//                 modelInfoList.append(LanguageModelInfo(
//                     provider=self.props.llmProvider,
//                     basemodel_uri=f"{self.getId()}://{model_name}",
//                     name=model_name,
//                     ready=True,
//                     weight=default_weight,
//                 ))
//         return modelInfoList
    
//     def _listLanguageModelsFromIndexes(self, feature: LlmFeature = LlmFeature.ALL) -> List[LanguageModelInfo]:
//         modelIndexesForEmbeddingTag = self._getModelTagIndexes(self.props.keyPrefix + "EMBEDDING_MODEL_INDEXES")
//         modelIndexesForVisionTag = self._getModelTagIndexes(self.props.keyPrefix + "VISION_MODEL_INDEXES")
//         modelIndexesForToolsTag = self._getModelTagIndexes(self.props.keyPrefix + "TOOLS_MODEL_INDEXES")

//         default_weight = os.environ.get(self.props.keyPrefix + "MODELS_DEFAULT_WEIGHT")
//         modelInfoList: List[LanguageModelInfo] = []
//         embedding_models_str = os.environ.get(self.props.keyPrefix + "SELECTED_MODELS")
//         if embedding_models_str is not None and len(embedding_models_str) > 0:
//             embedding_models_names = embedding_models_str.split(",")
//             for index, model_name in enumerate(embedding_models_names):
//                 if feature == LlmFeature.EMBEDDING and index not in modelIndexesForEmbeddingTag:
//                     continue

//                 if feature == LlmFeature.VISION and index not in modelIndexesForVisionTag:
//                     continue

//                 if feature == LlmFeature.TOOLS and index not in modelIndexesForToolsTag:
//                     continue

//                 if feature == LlmFeature.CONVERSATIONAL and index in modelIndexesForEmbeddingTag:
//                     # Non-embedding models are conversational
//                     continue

//                 modelInfoList.append(LanguageModelInfo(
//                     provider=self.props.llmProvider,
//                     basemodel_uri=f"{self.getId()}://{model_name}",
//                     name=model_name,
//                     ready=True,
//                     weight=default_weight,
//                 ))
//         return modelInfoList


//     def getBaseEmbeddingsModel(self, aif_agent_uri: str) -> Embeddings:
//         baseLlmInfo = self._parse_llm_uri(aif_agent_uri)
//         apiKey = os.environ.get(self.props.keyPrefix + "API_KEY")
//         return self._getBaseEmbeddingsModel(baseLlmInfo.model_name, apiKey=apiKey)
    
//     def _getBaseEmbeddingsModel(self, modelName: str, apiKey: str) -> Embeddings:
//         raise NotImplementedError("Subclasses must implement this method")


//     def getBaseLanguageModel(self, aif_agent_uri: str, functions: List[Callable] = []) -> BaseLanguageModel:
//         baseLlmInfo = self._parse_llm_uri(aif_agent_uri)
//         api_key = os.environ.get(self.props.keyPrefix + "API_KEY")
//         llm = self._getBaseLanguageModel(baseLlmInfo.model_name, api_key)

//         if not functions or len(functions) == 0:
//             return llm
//         else:
//             tools = [create_tool(func) for func in functions]
//             return llm.bind(functions=tools)
        
//     def _getBaseLanguageModel(self, modelName: str, apiKey: str) -> BaseLanguageModel:
//         raise NotImplementedError("Subclasses must implement this method")


//     def getLanguageProviderInfo(self) -> LmProviderInfo:
//         properties: dict[str, LmProviderProperty] = {
//             self.props.keyPrefix + "API_KEY": {
//                 "description": self.props.apiKeyDescription,
//                 "hint": self.props.apiKeyHint,
//                 "value": maskCredential(os.environ.get(self.props.keyPrefix + "API_KEY")),
//                 "isCredential": True,
//             },
//         }

//         models = self._getModelsFromFile() if self.props.jsonFileName else self._getModelsFromIndexes()
//         weight = os.environ.get(self.props.keyPrefix + "MODELS_DEFAULT_WEIGHT")

//         return LmProviderInfo(
//             lmProviderId=self.getId(),
//             name=self.getName(),
//             properties=properties,
//             weight= weight if weight else DEFAULT_MODEL_WEIGHT,
//             models=models,
//             supportUserDefinedModels=self.props.supportUserDefinedModels,
//         )

//     def _getModelsFromFile(self) -> LmProviderInfo:
//         models: List[LmProviderBaseModelInfo] = []
//         selectedModels = self._getModelNames(self.props.keyPrefix + "SELECTED_MODELS")
//         modelCatalogItems = read_json_file(os.path.dirname(__file__), self.props.jsonFileName)
//         for modelCatalogItem in modelCatalogItems:
//             models.append(LmProviderBaseModelInfo(
//                 id=modelCatalogItem["title"],
//                 selected=modelCatalogItem["title"] in selectedModels,
//                 tags=modelCatalogItem["tags"],
//             ))
//         return models

//     def _getModelsFromIndexes(self) -> LmProviderInfo:
//         modelNames = self._getModelNames(self.props.keyPrefix + "SELECTED_MODELS")
//         modelIndexesForEmbeddingTag = self._getModelTagIndexes(self.props.keyPrefix + "EMBEDDING_MODEL_INDEXES")
//         modelIndexesForVisionTag = self._getModelTagIndexes(self.props.keyPrefix + "VISION_MODEL_INDEXES")
//         modelIndexesForToolsTag = self._getModelTagIndexes(self.props.keyPrefix + "TOOLS_MODEL_INDEXES")

//         models: List[LmProviderBaseModelInfo] = []
//         for index, model in enumerate(modelNames):
//             tags = []
//             if index in modelIndexesForEmbeddingTag:
//                 tags.append(LlmFeature.EMBEDDING)
//             if index in modelIndexesForVisionTag:
//                 tags.append(LlmFeature.VISION)
//             if index in modelIndexesForToolsTag:
//                 tags.append(LlmFeature.TOOLS)
//             models.append(LmProviderBaseModelInfo(
//                 id=model,
//                 selected=True,
//                 isUserDefined=True,
//                 tags=tags,
//             ))
//         return models


//     def updateLmProvider(self, request: UpdateLmProviderRequest):
//         dotenv_file = dotenv.find_dotenv()
//         self._updateLmProviderStandardFields(dotenv_file, request, self.props.keyPrefix)

//         if request.properties:
//             if (self.props.keyPrefix + "API_KEY") in request.properties:
//                 self._updateLmProviderField(dotenv_file, self.props.keyPrefix + "API_KEY", request.properties[self.props.keyPrefix + "API_KEY"])


//     def _parse_llm_uri(self, aif_uri: str) -> BaseLlmInfo:
//         parsed_aif_model_uri = urlparse(aif_uri)
//         uriParams = getUriParams(parsed_aif_model_uri)
//         return BaseLlmInfo(
//             provider=self.props.llmProvider,
//             model_name=parsed_aif_model_uri.netloc,
//             api_version=uriParams.get("api-version"),
//         )


//     def _updateLmProviderIndexes(self, dotenv_file: str, request: UpdateLmProviderRequest):
//         if request.embeddingModelIndexes is not None:
//             self._updateLmProviderField(dotenv_file, self.props.keyPrefix + "EMBEDDING_MODEL_INDEXES", self._filterAndCombineIndexes(request, request.embeddingModelIndexes))
//         if request.visionModelIndexes is not None:
//             self._updateLmProviderField(dotenv_file, self.props.keyPrefix + "VISION_MODEL_INDEXES", self._filterAndCombineIndexes(request, request.visionModelIndexes))
//         if request.toolsModelIndexes is not None:
//             self._updateLmProviderField(dotenv_file, self.props.keyPrefix + "TOOLS_MODEL_INDEXES", self._filterAndCombineIndexes(request, request.toolsModelIndexes))


//     def _filterAndCombineIndexes(self, request: UpdateLmProviderRequest, indexes: List[int]) -> str:
//         # Filter request.embeddingModelIndexes, if it's equal or greater than the number of models, ignore it
//         _indexeStrings = []
//         for index in indexes:
//             if index < len(request.selectedModels):
//                 _indexeStrings.append(str(index))
//         return ",".join(_indexeStrings)

    private get jsonFileName(): string | null {
        return null;
    }
}

export default LmBaseProvider;
