import * as _ from 'lodash';
import type { Embeddings } from '@langchain/core/embeddings';
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AifUtils, api, consts, database } from 'aifoundry-vscode-shared';
import DatabaseManager from '../database/DatabaseManager';
import { HttpException } from '../exceptions';
import { ApiOutStream } from '../types/ApiOutStream';


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

    public get isLocal(): boolean {
        return this._info.isLocal;
    }

    abstract isHealthy(): Promise<boolean>;

    public canHandle(aifUri: string): boolean {
        return aifUri.startsWith(`${this.id}://`)
    }

    public async init(): Promise<void> {
        const initInfo = await this._getInitInfo();
        const initInfoModelMapVersion = initInfo.modelMapVersion ?? 0;

        let lmProviderInfo = this._databaseManager.getLmProviderInfo(initInfo.id);
        const lmProviderInfoModelMapVersion = lmProviderInfo?.modelMapVersion ?? 0;
        if (!lmProviderInfo || initInfoModelMapVersion > lmProviderInfoModelMapVersion) {
            lmProviderInfo = new database.LmProviderEntity(
                initInfo.id,
                initInfo.name,
                initInfo.description,
                initInfo.weight,
                initInfo.properties,
                initInfo.supportUserDefinedModels,
                initInfo.isLocal,
                initInfo.modelMap, // the flag isDownloaded will be updated in _updateLmProviderRuntimeInfo
                initInfo.modelMapVersion,
            );

            await this._updateLmProviderRuntimeInfo(lmProviderInfo);
            this._databaseManager.saveDbEntity(lmProviderInfo);
        } else {
            await this._updateLmProviderRuntimeInfo(lmProviderInfo);
        }
        this._info = lmProviderInfo;
    }
    protected abstract _getInitInfo(): Promise<GetInitInfoResponse>;
    protected async _updateLmProviderRuntimeInfo(lmProviderInfo: database.LmProviderEntity): Promise<void> {
        // Do nothing by default
    }

    public async listLanguageModels(feature: api.LlmFeature): Promise<api.LmProviderBaseModelInfo[]> {
        const isHealthy = await this.isHealthy();
        return !isHealthy ? [] : this._listLanguageModels(feature);
    }
    protected async _listLanguageModels(feature: api.LlmFeature): Promise<api.LmProviderBaseModelInfo[]> {
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
            isLocal: this._info.isLocal,
            modelMap: _.cloneDeep(this._info.modelMap),
            modelMapVersion: this._info.modelMapVersion,
            status,        
        };
    }

    public updateLmProviderInfo(request: api.UpdateLmProviderInfoRequest): api.UpdateLmProviderResponse {
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

        this._databaseManager.saveDbEntity(this._info);

        const response: api.UpdateLmProviderResponse = {
            id: this._info.id,
            name: this._info.name,
            description: this._info.description,
            weight: this._info.weight,
            properties: _.cloneDeep(this._info.properties),
            supportUserDefinedModels: this._info.supportUserDefinedModels,
            isLocal: this._info.isLocal,
            modelMap: _.cloneDeep(this._info.modelMap),
            modelMapVersion: this._info.modelMapVersion,
        }
        return response;
    }

    public updateLmProviderModel(_modelUriOrName: string, selected: boolean): api.UpdateLmProviderResponse {
        const modelUriInfo = AifUtils.extractAiUri(this._info.id, _modelUriOrName);
        const name = modelUriInfo?.parts[0] ?? _modelUriOrName;
        const feature = modelUriInfo?.parameters[consts.UpdateLmProviderBaseModelFeatureKey] as api.LlmFeature ?? undefined;
        const modelUri = name ? AifUtils.createAifUri(this._info.id, AifUtils.AifUriCategory.Models, name) : undefined;

        if (!modelUri || !name) {
            throw new HttpException(400, "Invalid model uri");
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

                // For Ollama, we have fixed list of models and it's local
                if (this._info.isLocal) {
                    (model as database.LmProviderBaseModelLocalInfo).isDownloaded = true;
                }
            } else if (feature && this._info.supportUserDefinedModels) {
                const modelInfo: api.LmProviderBaseModelInfo = {
                    uri: modelUri,
                    name,
                    providerId: this._info.id,
                    features: [feature],
                    isUserDefined: true,
                }

                if (this._info.isLocal) {
                    // For HuggingFace, we don't have fixed list of models, and it's local
                    // For local model, we don't know the model is downloaded or not for now, need to wait for the next refresh
                    (modelInfo as database.LmProviderBaseModelLocalInfo).isDownloaded = false;
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

                if (model.features.length === 0 && this._info.supportUserDefinedModels) {
                    delete this._info.modelMap[model.name];
                }
            }
        }

        this._databaseManager.saveDbEntity(this._info);

        const response: api.UpdateLmProviderResponse = {
            id: this._info.id,
            name: this._info.name,
            description: this._info.description,
            weight: this._info.weight,
            properties: _.cloneDeep(this._info.properties),
            supportUserDefinedModels: this._info.supportUserDefinedModels,
            isLocal: this._info.isLocal,
            modelMap: _.cloneDeep(this._info.modelMap),
            modelMapVersion: this._info.modelMapVersion,
        }
        return response;
    }

    public downloadLocalLanguageModel(id: string, out: ApiOutStream): void {
        // Local language model provider should override this method
        out.error("Only local language model provider supports download");
    }

    public deleteLocalLanguageModel(id: string, out: ApiOutStream): void {
        // Local language model provider should override this method
        out.error("Only local language model provider supports delete");
    }
}

export default LmBaseProvider;
