import { LlmFeature } from "../api";
import { BaseEntity } from "./BaseEntity";

export type LmProviderProperty = {
	description: string,
	hint: string,
    isSecret: boolean,
	valueUri: string | null,    // Examples:
                                //  * Normal value: `aif://values/plain/[value]`
                                //  * Credential URI for un-encryted secret: `aif://values/secret/[value]`
                                //  * Credential URI from cloud providers: `azure://keyvault/[key-vault-name]/[secret-name]`
}

export type LmProviderBaseModelInfo = {
    // Example: "azureopenai://models/gpt-4o-mini?version=2024-07-01-preview", "ollama://models/mxbai-embed-large", "openai://models/gpt-4o-mini"
    uri: string,
    name: string,
    providerId: string,
    features: LlmFeature[],
	// For provider of model catelog, e.g. Azure AI, the users can add custom model name (or deployment name) + version, and they can delete it
	isUserDefined: boolean,
}

export type LmProviderBaseModelLocalInfo = LmProviderBaseModelInfo & {
    isDownloaded: boolean,
}

// For LmProviderEntity, "id" is the provider id
export class LmProviderEntity extends BaseEntity {
    public static readonly ENTITY_NAME = "LmProviderEntity";

    public get version(): number { return 1 };

    constructor(
        public id: string,
        public name: string,
        public description: string,
        public weight: number,
        public properties: Record<string, LmProviderProperty>,
        public supportUserDefinedModels: boolean,
        public isLocal: boolean,        // Is local model or not, e.g. Ollama
        public modelMap: Record<string, LmProviderBaseModelInfo>,
    ) {
        super(id);
    }
}
