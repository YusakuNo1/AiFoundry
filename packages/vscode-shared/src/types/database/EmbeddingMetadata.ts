
import { BaseEntity } from "./BaseEntity"

export class EmbeddingMetadata extends BaseEntity {
    public static readonly ENTITY_NAME = "EmbeddingMetadata";

    public get version(): number { return 1 };

    constructor(
        public id: string,
        public name: string,
        public vs_provider: string,
        public basemodel_uri: string,
    ) {
        super(id);
    }
}
