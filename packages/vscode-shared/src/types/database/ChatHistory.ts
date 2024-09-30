
import { UploadFileInfo } from "../common";
import { BaseEntity } from "./BaseEntity"

type ChatHistoryMessage = {
    role: string,
    contentTextFormat: string,
    content: string,
    files: UploadFileInfo[],
}

export class ChatHistory extends BaseEntity {
    public static readonly ENTITY_NAME = "ChatHistory";

    public get version(): number { return 1 };

    constructor(
        public id: string,
        public aif_agent_uri: string,
        public messages: string | ChatHistoryMessage[],   // TODO: JSON string type is the legacy one for Python, ChatHistoryMessage is the new one for TypeScript
    ) {
        super(id);
    }
}
