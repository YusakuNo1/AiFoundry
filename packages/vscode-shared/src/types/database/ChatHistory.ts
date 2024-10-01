
import { UploadFileInfo } from "../common";
import { BaseEntity } from "./BaseEntity"

export type ChatHistoryMessage = {
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
        public messages: ChatHistoryMessage[],
    ) {
        super(id);
    }
}
