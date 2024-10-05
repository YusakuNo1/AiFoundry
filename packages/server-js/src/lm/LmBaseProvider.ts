import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { types } from 'aifoundry-vscode-shared';
import DatabaseManager from '../database/DatabaseManager';
import { LmProviderPropertyUtils } from 'aifoundry-vscode-shared';


export type GetInitInfoResponse = Omit<types.database.LmProviderInfo, "version" | "entityName">;

abstract class LmBaseProvider {
    protected _info: types.database.LmProviderInfo;
    protected _databaseManager: DatabaseManager;

    public constructor(databaseManager: DatabaseManager) {
        this._databaseManager = databaseManager;
    }

    public get id(): string {
        return this._info.id;
    }

    public get name(): string {
        return this._info.name;
    }

    abstract isHealthy(): Promise<boolean>;

    public canHandle(aifUri: string): boolean {
        return aifUri.startsWith(`${this.id}://`)
    }

    public init(databaseManager: DatabaseManager): void {
        const initInfo = this._getInitInfo();

        let lmProviderInfo = databaseManager.getLmProviderInfo(initInfo.id);
        if (!lmProviderInfo) {
            lmProviderInfo = new types.database.LmProviderInfo(
                initInfo.id,
                initInfo.name,
                initInfo.description,
                initInfo.weight,
                initInfo.properties,
                initInfo.supportUserDefinedModels,
                initInfo.modelMap,
            );
            databaseManager.saveDbEntity(lmProviderInfo);
        }
        this._info = lmProviderInfo;
    }
    protected abstract _getInitInfo(): GetInitInfoResponse;

    abstract listLanguageModels(feature: types.api.LlmFeature): types.api.LmProviderBaseModelInfo[];

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

    public async getLmProviderInfo(databaseManager: DatabaseManager): Promise<types.api.LmProviderInfoResponse> {
        const properties = { ...this._info.properties };
        for (const key of Object.keys(properties)) {
            properties[key].valueUri = LmProviderPropertyUtils.getValueFromValueUri(properties[key].valueUri);
        }

        return {
            id: this.id,
            name: this.name,
            description: this._info.description,
            weight: this._info.weight,
            properties,
            supportUserDefinedModels: this._info.supportUserDefinedModels,
            modelMap: this._info.modelMap,
            status: await this.isHealthy() ? "available" : "unavailable",        
        };
    }

    public updateLmProviderInfo(databaseManager: DatabaseManager, request: types.api.UpdateLmProviderInfoRequest): types.api.UpdateLmProviderResponse {
        this._info.name = request.name ?? this._info.name;
        this._info.weight = request.weight ?? this._info.weight;

        if (request.properties) {
            for (const key of Object.keys(request.properties)) {
                if (this._info.properties[key]) {
                    this._info.properties[key].valueUri = request.properties[key].valueUri;
                }
            }
        }

        databaseManager.saveDbEntity(this._info);

        const response: types.api.UpdateLmProviderResponse = {
            id: this._info.id,
            name: this._info.name,
            description: this._info.description,
            weight: this._info.weight,
            properties: this._info.properties,
            supportUserDefinedModels: this._info.supportUserDefinedModels,
            modelMap: this._info.modelMap,
        }
        return response;
    }

    public updateLmProviderModel(databaseManager: DatabaseManager, request: types.api.UpdateLmProviderModelRequest): types.api.UpdateLmProviderResponse {
        for (const key of Object.keys(this._info.modelMap)) {
            if (request.modelUri === this._info.modelMap[key].uri) {
                this._info.modelMap[key].selected = request.selected;
                break;
            }
        }

        this._info.modelMap = this._info.modelMap;
        databaseManager.saveDbEntity(this._info);

        const response: types.api.UpdateLmProviderResponse = {
            id: this._info.id,
            name: this._info.name,
            description: this._info.description,
            weight: this._info.weight,
            properties: this._info.properties,
            supportUserDefinedModels: this._info.supportUserDefinedModels,
            modelMap: this._info.modelMap,
        }
        return response;
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
}

export default LmBaseProvider;
