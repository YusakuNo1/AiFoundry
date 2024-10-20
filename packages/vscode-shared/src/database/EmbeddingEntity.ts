
import { BaseEntity } from "./BaseEntity"

export class EmbeddingEntity extends BaseEntity {
    public static readonly ENTITY_NAME = "EmbeddingEntity";

    public get version(): number { return 1 };

    constructor(
        public id: string,
        public name: string,
        public vs_provider: string,
        public basemodelUri: string,
    ) {
        super(id);
    }
}
