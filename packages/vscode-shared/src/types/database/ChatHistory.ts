
import { BaseEntity } from "./BaseEntity"

export class ChatHistory extends BaseEntity {
    public static readonly ENTITY_NAME = "ChatHistory";

    public get version(): number { return 1 };

    constructor(
        public id: string,
        public aif_agent_uri: string,
        public messages: string,        // TODO: it's JSON string currently, but can be a JSON now
    ) {
        super(id);
    }
}
