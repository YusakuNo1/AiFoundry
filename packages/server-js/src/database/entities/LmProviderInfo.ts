
import { types } from "aifoundry-vscode-shared"

// For LmProviderInfo, "id" is the provider id
export class LmProviderInfo extends types.database.BaseEntity {
    public static readonly ENTITY_NAME = "LmProviderInfo";

    public get version(): number { return 1 };

    constructor(
        public id: string,
        public defaultWeight: number,
        public selectedEmbeddingModels: string[],
        public selectedVisionModels: string[],
        public selectedToolsModels: string[],
    ) {
        super(id);
    }
}
