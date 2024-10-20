import { BaseEntity } from "./BaseEntity"

export class AgentMetadata extends BaseEntity {
    public static readonly ENTITY_NAME = "AgentMetadata";

    public get version(): number { return 1 };

    constructor(
        public id: string,
        public agentUri: string,
        public name: string,
        public basemodelUri: string,
        public systemPrompt: string,
        public ragAssetIds: string[],
        public functionAssetIds: string[],
    ) {
        super(id);
    }
}
