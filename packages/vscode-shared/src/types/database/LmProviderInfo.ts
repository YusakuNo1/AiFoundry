import { LlmFeature } from "../api";
import { BaseEntity } from "./BaseEntity";

export type LmProviderProperty = {
	description: string,
	hint: string,
    isSecret: boolean,
	valueUri: string | null,    // Examples:
                                //  * Normal value: `aif://plain/[value]
                                //  * Credential URI for un-encryted secret: `aif://secret/[value]
                                //  * Credential URI from cloud providers: `azure://keyvault/[key-vault-name]/[secret-name]
}

export type LmProviderBaseModelInfo = {
    // Example: "azureopenai://models/gpt-4o-mini?version=2024-07-01-preview", "ollama://models/mxbai-embed-large", "openai://models/gpt-4o-mini"
    uri: string,
    name: string,
    providerId: string,
    features: LlmFeature[],
	selected: boolean,
	// For provider of model catelog, e.g. Azure AI, the users can add custom model name (or deployment name) + version, and they can delete it
	isUserDefined: boolean,
	tags: string[],
}

// For LmProviderInfo, "id" is the provider id
export class LmProviderInfo extends BaseEntity {
    public static readonly ENTITY_NAME = "LmProviderInfo";

    public get version(): number { return 1 };

    constructor(
        public id: string,
        public name: string,
        public description: string,
        public weight: number,
        public properties: Record<string, LmProviderProperty>,
        public supportUserDefinedModels: boolean,
        public modelMap: Record<string, LmProviderBaseModelInfo>,
    ) {
        super(id);
    }
}
