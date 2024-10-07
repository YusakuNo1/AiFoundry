import { UploadFileInfo } from "../common";
import { BaseEntity } from "./BaseEntity"

export type ChatHistoryMessageTextContentItem = {
    type: "text",
    text: string,
};
export type ChatHistoryMessageImageUrlContentItem = {
    type: "image_url",
    image_url: {
        url: string,
        detail?: "auto" | "low" | "high",
    },
};
export type ChatHistoryMessageContent = (ChatHistoryMessageTextContentItem | ChatHistoryMessageImageUrlContentItem)[];

export type ChatHistoryMessage = {
    role: string,
    contentTextFormat: string,
    content: ChatHistoryMessageContent,
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
