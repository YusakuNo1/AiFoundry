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

export type ChatHistoryMessage = {
	role: ChatRole,
    contentTextFormat: TextFormat,
	content: string,
}

export type ChatHistory = {
    id: string,
    messages: ChatHistoryMessage[],
}
