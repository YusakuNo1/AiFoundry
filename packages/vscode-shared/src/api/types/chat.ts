import {
    ChatHistoryMessage as DatabaseChatHistoryMessage,
    ChatHistoryEntity as DatabaseChatHistoryEntity,
    ChatHistoryMessageContent as DatabaseChatHistoryMessageContent,
} from "../../database/ChatHistoryEntity";

export const TextFormats = ["plain", "markdown", "latex"] as const;
export const TextFormatDisplayNames = {
    plain: "Plain Text",
    markdown: "Markdown",
    latex: "LaTeX",
};
export const TextFormatPrompts: Record<TextFormat, string> = {
    "plain": "The response is in plain text format.",
    "markdown": "The response is in markdown format.",
    "latex": "The response is in LaTeX format."
}
export type TextFormat = typeof TextFormats[number];
export const defaultTextFormat: TextFormat = "plain";

export enum ChatRole {
    USER = 'USER',
    ASSISTANT = 'ASSISTANT',
}

export type ChatHistoryMessage = Omit<DatabaseChatHistoryMessage, "ENTITY_NAME" | "version">;

export type ChatHistoryEntity = Omit<DatabaseChatHistoryEntity, "ENTITY_NAME" | "version">;

export type ChatHistoryMessageContent = DatabaseChatHistoryMessageContent;