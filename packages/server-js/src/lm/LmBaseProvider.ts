import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { types } from 'aifoundry-vscode-shared';
import ILmProvider from "./ILmProvider";
import DatabaseManager from '../database/DatabaseManager';
import { HttpException } from '../exceptions';
import { LmProviderInfo } from '../database/entities/LmProviderInfo';

type LmBaseProviderProps = {
    id: string;
    name: string;
    description: string | null;
    defaultWeight: number;
    // llmProvider: types.api.LlmProvider;
    jsonFileName: string | null;
    keyPrefix: string;
    apiKeyDescription: string | null;
    apiKeyHint: string | null;
    supportUserDefinedModels: boolean;
}

abstract class LmBaseProvider implements ILmProvider {
    protected _props: LmBaseProviderProps;
    protected _databaseManager: DatabaseManager;

    public constructor(databaseManager: DatabaseManager, props: LmBaseProviderProps) {
        this._databaseManager = databaseManager;
        this._props = props;
    }

    public get id(): string {
        return this._props.id;
    }

    public get name(): string {
        return this._props.name;
    }

    abstract get isHealthy(): boolean;

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

    public getBaseEmbeddingsModel(aifUri: string): Embeddings {
        const lmInfo = this._parseLmUri(aifUri);
        const credentials = this._databaseManager.getLmProviderCredentials(this.id);
        if (!lmInfo || !credentials) {
            throw new HttpException(400, "Invalid uri or credentials not found");
        }

        return this._getBaseEmbeddingsModel(lmInfo.modelName, credentials.apiKey, credentials.properties);
    }

    protected abstract _getBaseEmbeddingsModel(modelName: string, apiKey: string, properties: Record<string, string>): Embeddings;

    public getBaseLanguageModel(aifUri: string): BaseChatModel {
        const lmInfo = this._parseLmUri(aifUri);
        const credentials = this._databaseManager.getLmProviderCredentials(this.id);
        if (!lmInfo || !credentials) {
            throw new HttpException(400, "Invalid uri or credentials not found");
        }

        // TODO: for function calling
        // functions: Function[] = []

        return this._getBaseChatModel(lmInfo.modelName, credentials.apiKey, credentials.properties);
    }

    protected abstract _getBaseChatModel(modelName: string, apiKey: string, properties: Record<string, string>): BaseChatModel;

//     def getBaseLanguageModel(self, aif_agent_uri: str, functions: List[Callable] = []) -> BaseLanguageModel:
//         baseLlmInfo = self._parse_llm_uri(aif_agent_uri)
//         api_key = os.environ.get(self.props.keyPrefix + "API_KEY")
//         llm = self._getBaseChatModel(baseLlmInfo.model_name, api_key)

//         if not functions or len(functions) == 0:
//             return llm
//         else:
//             tools = [create_tool(func) for func in functions]
//             return llm.bind(functions=tools)
        
//     def _getBaseChatModel(self, modelName: str, apiKey: str) -> BaseLanguageModel:
//         raise NotImplementedError("Subclasses must implement this method")

    // abstract getLanguageProviderInfo(): types.api.LmProviderInfo;

    public registerProviderInfo(databaseManager: DatabaseManager): void {
        // If the provider is not registered in databse, register it
        let lmProviderInfo = databaseManager.getLmProviderInfo(this.id);
        if (lmProviderInfo) {
            return;
        }

        lmProviderInfo = new LmProviderInfo(
            this.id,
            this._props.defaultWeight,
            [],
            [],
            [],
        ); 
        databaseManager.saveDbEntity(lmProviderInfo);
    }

    public getLanguageProviderInfo(databaseManager: DatabaseManager): types.api.LmProviderInfo {
        const lmProviderInfo = databaseManager.getLmProviderInfo(this.id);
        if (!lmProviderInfo) {
            throw new HttpException(404, "LmProvider not found");
        }

        return {
            lmProviderId: this.id,
            name: this.name,
            properties: {}, // this._getCredentialProperties(["API_BASE", "API_VERSION"]),
            weight: lmProviderInfo.defaultWeight,
            supportUserDefinedModels: this._props.supportUserDefinedModels,
            models: [], // lmProviderInfo.selectedEmbeddingModels,
            status: this.isHealthy ? "available" : "unavailable",        
        };
    }

    private _listLanguageModelsFromFile(feature: types.api.LlmFeature): types.api.LanguageModelInfo[] {
        const modelCatalogItems = require(`./${this.jsonFileName}`);
        const modelCatalogItemDict = modelCatalogItems.reduce((acc: Record<string, any>, item: any) => {
            acc[item.title] = item;
            return acc;
        }, {});
        return {} as any;
    }

    protected _parseLmUri(aifUri: string): { modelName: string, apiVersion: string } | null {
        const url = new URL(aifUri);
        const params = url.searchParams;

        if (!url.hostname) {
            return null;
        } else {
            return {
                modelName: url.hostname,
                apiVersion: params.get("api-version") || "",
            };    
        }
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
//                     basemodelUri=f"{self.getId()}://{model_name}",
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
//                     basemodelUri=f"{self.getId()}://{model_name}",
//                     name=model_name,
//                     ready=True,
//                     weight=default_weight,
//                 ))
//         return modelInfoList

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
