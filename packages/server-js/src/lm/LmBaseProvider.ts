import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { types } from 'aifoundry-vscode-shared';
import DatabaseManager from '../database/DatabaseManager';
import { HttpException } from '../exceptions';
import { LmProviderPropertyUtils } from 'aifoundry-vscode-shared';

type LmBaseProviderProps = {
    id: string;
    name: string;
    description: string | null;
    weight: number;
    keyPrefix: string;
    apiKeyDescription: string | null;
    apiKeyHint: string | null;
    supportUserDefinedModels: boolean;
    modelMap: Record<string, types.api.LmProviderBaseModelInfo>;
}

abstract class LmBaseProvider {
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

    abstract isHealthy(): Promise<boolean>;

    public canHandle(aifUri: string): boolean {
        return aifUri.startsWith(`${this.id}://`)
    }

    public listLanguageModels(feature: types.api.LlmFeature): types.api.LmProviderBaseModelInfo[] {
        if (this.jsonFileName) {
            return this._listLanguageModelsFromFile(feature);
        } else {
            // return this._listLanguageModelsFromIndexes(feature);
            return [];
        }
    }

    public getBaseEmbeddingsModel(aifUri: string): Embeddings {
        const lmInfo = this._parseLmUri(aifUri);
        throw new Error("not implemented");
        // const credentials = this._databaseManager.getLmProviderCredentials(this.id);
        // if (!lmInfo || !credentials) {
        //     throw new HttpException(400, "Invalid uri or credentials not found");
        // }

        // return this._getBaseEmbeddingsModel(lmInfo.modelName, credentials.apiKey, credentials.properties);
    }

    protected abstract _getBaseEmbeddingsModel(modelName: string, apiKey: string, properties: Record<string, string>): Embeddings;

    public getBaseLanguageModel(aifUri: string): BaseChatModel {
        const lmInfo = this._parseLmUri(aifUri);
        throw new Error("not implemented");
        // const credentials = this._databaseManager.getLmProviderCredentials(this.id);
        // if (!lmInfo || !credentials) {
        //     throw new HttpException(400, "Invalid uri or credentials not found");
        // }

        // // TODO: for function calling
        // // functions: Function[] = []

        // return this._getBaseChatModel(lmInfo.modelName, credentials.apiKey, credentials.properties);
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

    // abstract getLmProviderInfo(): types.api.LmProviderInfo;

    public registerProviderInfo(databaseManager: DatabaseManager): void {
        // If the provider is not registered in databse, register it
        let lmProviderInfo = databaseManager.getLmProviderInfo(this.id);
        if (!!lmProviderInfo) {
            return;
        }

        lmProviderInfo = new types.database.LmProviderInfo(
            this.id,
            this.name,
            this._props.weight,
            {},
            this._props.supportUserDefinedModels,
            this._props.modelMap,
        ); 
        databaseManager.saveDbEntity(lmProviderInfo);
    }

    public async getLmProviderInfo(databaseManager: DatabaseManager): Promise<types.api.LmProviderInfoResponse> {
        const lmProviderInfo = databaseManager.getLmProviderInfo(this.id);
        if (!lmProviderInfo) {
            throw new HttpException(404, "LmProvider not found");
        }

        // Filter out the credential properties
        const properties = { ...lmProviderInfo.properties };
        for (const key of Object.keys(properties)) {
            properties[key].valueUri = LmProviderPropertyUtils.getValueFromValueUri(properties[key].valueUri);
        }

        return {
            id: this.id,
            name: this.name,
            weight: lmProviderInfo.weight,
            properties,
            supportUserDefinedModels: this._props.supportUserDefinedModels,
            modelMap: lmProviderInfo.modelMap,
            status: await this.isHealthy() ? "available" : "unavailable",        
        };
    }

    public updateLmProvider(databaseManager: DatabaseManager, request: types.api.UpdateLmProviderRequest): types.api.UpdateLmProviderResponse {
        const lmProviderInfo = databaseManager.getLmProviderInfo(request.lmProviderId);
        if (!lmProviderInfo) {
            throw new HttpException(404, "Language model not found");
        }

        if (request.weight) {
            lmProviderInfo.weight = request.weight;
        }

        if (request.selectedModels) {
            const selectedConversationModels: string[] = [];
            const selectedEmbeddingModels: string[] = [];
            const selectedVisionModels: string[] = [];
            const selectedToolsModels: string [] = [];
    
            for (let i = 0; i < request.selectedModels.length; ++i) {
                if (request.embeddingModelIndexes && request.embeddingModelIndexes.includes(i)) {
                    selectedEmbeddingModels.push(request.selectedModels[i]);
                } else {
                    selectedConversationModels.push(request.selectedModels[i]);
                }

                if (request.visionModelIndexes && request.visionModelIndexes.includes(i)) {
                    selectedVisionModels.push(request.selectedModels[i]);
                }

                if (request.toolsModelIndexes && request.toolsModelIndexes.includes(i)) {
                    selectedToolsModels.push(request.selectedModels[i]);
                }
            }

            if (!request.embeddingModelIndexes) {
                selectedConversationModels.push(...request.selectedModels);
            }
        }

        databaseManager.saveDbEntity(lmProviderInfo);

        // lmProviderId: string,
        // name: string,
        // properties: Record<string, LmProviderProperty>,
        // weight: number,
        // supportUserDefinedModels: boolean,
        // models: LmProviderBaseModelInfo[],
        // status: string,

        throw new HttpException(500, "not implemented");

        // const propertiesPair = Object.keys(lmProviderCredentials.properties).map(key => [key, lmProviderCredentials.properties[key].value])

        // const response: types.api.UpdateLmProviderResponse = {
        //     lmProviderId: lmProviderInfo.id,
        //     name: lmProviderInfo.name,
        //     properties: lmProviderCredentials.properties,

        // }

        // return response;
    }

    private _listLanguageModelsFromFile(feature: types.api.LlmFeature): types.api.LmProviderBaseModelInfo[] {
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

    private get jsonFileName(): string | null {
        return null;
    }
}

export default LmBaseProvider;
