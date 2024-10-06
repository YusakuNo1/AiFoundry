import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AifUtils, consts, types } from 'aifoundry-vscode-shared';
import DatabaseManager from '../database/DatabaseManager';


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

    public abstract listLanguageModels(feature: types.api.LlmFeature): types.api.LmProviderBaseModelInfo[];

    public abstract getBaseEmbeddingsModel(aifUri: string): Promise<Embeddings>;

    public abstract getBaseLanguageModel(aifUri: string): Promise<BaseChatModel>;

    public async getLmProviderInfo(databaseManager: DatabaseManager): Promise<types.api.LmProviderInfoResponse> {
        const properties = { ...this._info.properties };
        for (const key of Object.keys(properties)) {
            const valueUri = properties[key].valueUri;
            const valueUriInfo = AifUtils.extractAiUri(null, valueUri ?? "");
            if (valueUriInfo?.protocol === consts.AIF_PROTOCOL && valueUriInfo?.category === AifUtils.AifUriCategory.Values && valueUriInfo?.parts.length === 2) {
                const valueType = valueUriInfo.parts[0];
                let value = valueUriInfo.parts[1];

                if (valueType === AifUtils.AifUriValueType.Plain) {
                    // Do nothing
                } else if (valueType === AifUtils.AifUriValueType.Secret) {
                    value = consts.LM_PROVIDER_PROP_VALUE_MASK.repeat(value.length);
                } else {
                    throw new Error(`Unsupported value type: ${valueType}`);
                }

                properties[key].valueUri = AifUtils.createAifUri(consts.AIF_PROTOCOL, AifUtils.AifUriCategory.Values, [valueType, value]);
            } else {
                throw new Error(`Invalid value URI: ${valueUri}`);
            }
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
        const modelUriInfo = AifUtils.extractAiUri(this._info.id, request.modelUri);
        const name = modelUriInfo?.parts[0] ?? undefined;
        const feature = modelUriInfo?.parameters[consts.UpdateLmProviderBaseModelFeatureKey] as types.api.LlmFeature ?? undefined;
        const modelUri = name ? AifUtils.createAifUri(this._info.id, AifUtils.AifUriCategory.Models, name) : undefined;

        // Find the model in the model map and update the selected field
        let foundModel = false;
        for (const key of Object.keys(this._info.modelMap)) {
            if (modelUri === this._info.modelMap[key].uri) {
                foundModel = true;
                const model = this._info.modelMap[key];
                model.selected = request.selected;

                // If it's the request to update the feature, update the feature
                if (this._info.supportUserDefinedModels && request.selected && feature && model.features.indexOf(feature) === -1) {
                    model.features.push(feature);
                }
                break;
            }
        }

        // Add the new model to the model map
        if (!foundModel && this._info.supportUserDefinedModels && request.selected && modelUri && name && feature) {
            const modelInfo: types.api.LmProviderBaseModelInfo = {
                uri: modelUri,
                name,
                providerId: this._info.id,
                features: [feature],
                selected: true,
                isUserDefined: true,
                tags: [],
            }
            this._info.modelMap[name] = modelInfo    
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
}

export default LmBaseProvider;
