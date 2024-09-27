import { BaseEntity } from "./BaseEntity"

export class AgentMetadata extends BaseEntity {
    public static readonly ENTITY_NAME = "AgentMetadata";

    public get version(): number { return 1 };

    constructor(
        public id: string,
        public agent_uri: string,
        public name: string,
        public base_model_uri: string,
        public system_prompt: string,
        public rag_asset_ids: string[],
        public function_asset_ids: string[],
    ) {
        super(id);
    }
}
