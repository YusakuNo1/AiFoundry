import * as _ from 'lodash';
import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AifUtils, api, consts, database } from 'aifoundry-vscode-shared';
import DatabaseManager from '../database/DatabaseManager';
import { HttpException } from '../exceptions';


export type GetInitInfoResponse = Omit<database.LmProviderEntity, "version" | "entityName">;

abstract class LmBaseProvider {
    protected _info: database.LmProviderEntity;
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

    public async init(databaseManager: DatabaseManager): Promise<void> {
        const initInfo = await this._getInitInfo();

        let lmProviderInfo = databaseManager.getLmProviderInfo(initInfo.id);
        if (!lmProviderInfo) {
            lmProviderInfo = new database.LmProviderEntity(
                initInfo.id,
                initInfo.name,
                initInfo.description,
                initInfo.weight,
                initInfo.properties,
                initInfo.supportUserDefinedModels,
                initInfo.modelMap,
            );

            await this._updateLmProviderRuntimeInfo(lmProviderInfo);
            databaseManager.saveDbEntity(lmProviderInfo);
        } else {
            await this._updateLmProviderRuntimeInfo(lmProviderInfo);
        }
        this._info = lmProviderInfo;
    }
    protected abstract _getInitInfo(): Promise<GetInitInfoResponse>;
    protected async _updateLmProviderRuntimeInfo(lmProviderInfo: database.LmProviderEntity): Promise<void> {
        // Do nothing by default
    }

    public listLanguageModels(feature: api.LlmFeature): api.LmProviderBaseModelInfo[] {
        return Object.values(this._info.modelMap).filter((model) => feature === "all" || model.features.includes(feature));
    }

    public abstract getBaseEmbeddingsModel(aifUri: string): Promise<Embeddings>;

    public abstract getBaseLanguageModel(aifUri: string): Promise<BaseChatModel>;

    public async getLmProviderInfo(force: boolean): Promise<api.LmProviderInfoResponse> {
        if (force) {
            await this._updateLmProviderRuntimeInfo(this._info);
            this._databaseManager.saveDbEntity(this._info);
        }

        const status = await this.isHealthy() ? "available" : "unavailable";
        return {
            id: this.id,
            name: this.name,
            description: this._info.description,
            weight: this._info.weight,
            properties: _.cloneDeep(this._info.properties),
            supportUserDefinedModels: this._info.supportUserDefinedModels,
            modelMap: _.cloneDeep(this._info.modelMap),
            status,        
        };
    }

    public updateLmProviderInfo(databaseManager: DatabaseManager, request: api.UpdateLmProviderInfoRequest): api.UpdateLmProviderResponse {
        this._info.name = request.name ?? this._info.name;
        this._info.weight = request.weight ?? this._info.weight;

        if (request.properties) {
            for (const key of Object.keys(request.properties)) {
                if (this._info.properties[key]) {
                    const value = request.properties[key];
                    const protocol = AifUtils.getProtocol(value);
                    if (!protocol) {
                        const valueType = this._info.properties[key].isSecret ? AifUtils.AifUriValueType.Secret : AifUtils.AifUriValueType.Plain;
                        this._info.properties[key].valueUri = AifUtils.createAifUri(
                            consts.AIF_PROTOCOL,
                            AifUtils.AifUriCategory.Values,
                            [valueType, value],
                        );
                    } else {
                        this._info.properties[key].valueUri = value;
                    }
                }
            }
        }

        databaseManager.saveDbEntity(this._info);

        const response: api.UpdateLmProviderResponse = {
            id: this._info.id,
            name: this._info.name,
            description: this._info.description,
            weight: this._info.weight,
            properties: _.cloneDeep(this._info.properties),
            supportUserDefinedModels: this._info.supportUserDefinedModels,
            modelMap: _.cloneDeep(this._info.modelMap),
        }
        return response;
    }

    public updateLmProviderModel(databaseManager: DatabaseManager, _modelUri: string, selected: boolean): api.UpdateLmProviderResponse {
        const modelUriInfo = AifUtils.extractAiUri(this._info.id, _modelUri);
        const name = modelUriInfo?.parts[0] ?? undefined;
        const feature = modelUriInfo?.parameters[consts.UpdateLmProviderBaseModelFeatureKey] as api.LlmFeature ?? undefined;
        const modelUri = name ? AifUtils.createAifUri(this._info.id, AifUtils.AifUriCategory.Models, name) : undefined;

        if (!modelUri || !name) {
            throw new HttpException(400, "Invalid model uri");
        } else if (!feature) {
            throw new HttpException(400, `Invalid feature name: ${feature}`);
        }

        let model: database.LmProviderBaseModelInfo | null = null;
        for (const key of Object.keys(this._info.modelMap)) {
            if (modelUri === this._info.modelMap[key].uri) {
                model = this._info.modelMap[key];
                break;
            }
        }

        if (selected) {
            // If the model exists:
            //      If it includes non-existing feature, add the feature
            //      If it's local language model provider, set it as downloaded
            // Otherwise, if it supports user defined models, create a new model 
            // Otherwise, throw an error as "invalid operation"
            if (model) {
                if (feature && model.features.indexOf(feature) === -1) {
                    model.features.push(feature);
                }

                if (this._info.modelMap[name].isLocal) {
                    (model as database.LmProviderBaseModelLocalInfo).isDownloaded = true;
                }
            } else if (this._info.supportUserDefinedModels) {
                const modelInfo: api.LmProviderBaseModelInfo = {
                    uri: modelUri,
                    name,
                    providerId: this._info.id,
                    features: [feature],
                    isUserDefined: true,
                    isLocal: false,
                }
                this._info.modelMap[name] = modelInfo;    
            } else {
                throw new HttpException(400, "Invalid opeation");
            }
        } else {
            // If the model exists, remove the feature, if no feature left, remove the model
            if (model) {
                const index = model.features.indexOf(feature);
                if (index !== -1) {
                    model.features.splice(index, 1);
                }

                if (model.features.length === 0) {
                    delete this._info.modelMap[model.name];
                }
            }
        }

        databaseManager.saveDbEntity(this._info);

        const response: api.UpdateLmProviderResponse = {
            id: this._info.id,
            name: this._info.name,
            description: this._info.description,
            weight: this._info.weight,
            properties: _.cloneDeep(this._info.properties),
            supportUserDefinedModels: this._info.supportUserDefinedModels,
            modelMap: _.cloneDeep(this._info.modelMap),
        }
        return response;
    }
}

export default LmBaseProvider;
