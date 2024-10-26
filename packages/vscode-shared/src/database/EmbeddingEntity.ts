import { SplitterParams } from "../misc/common";
import { BaseEntity } from "./BaseEntity"

export class EmbeddingEntity extends BaseEntity {
    public static readonly ENTITY_NAME = "EmbeddingEntity";

    public get version(): number { return 1 };

    constructor(
        public id: string,
        public name: string,
        public vectorStoreProvider: string,
        public basemodelUri: string,
        public description: string,         // summary of the file content, no more than 100 characters
        public fileNames: string[],
        public splitterParams: SplitterParams,
        public searchTopK: number,   // sample size for similarity search
    ) {
        super(id);
    }
}
