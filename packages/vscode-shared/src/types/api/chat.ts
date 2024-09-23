import { UploadFileInfo } from "../common";

export const TextFormats = ["plain", "markdown", "latex"] as const;
export const TextFormatDisplayNames = {
    plain: "Plain Text",
    markdown: "Markdown",
    latex: "LaTeX",
};
export type TextFormat = typeof TextFormats[number];
export const defaultTextFormat: TextFormat = "plain";

export enum ChatRole {
    USER = 'USER',
    ASSISTANT = 'ASSISTANT',
}

export type ChatHistoryMessageFile = UploadFileInfo & {
    type: "image",
}

export type ChatHistoryMessage = {
	role: ChatRole,
    contentTextFormat: TextFormat,
	content: string,
    files?: ChatHistoryMessageFile[],
}

export type ChatHistory = {
    id: string,
    messages: ChatHistoryMessage[],
}

export type ChatRequest = {
    input: string,
    outputFormat: TextFormat,
}
