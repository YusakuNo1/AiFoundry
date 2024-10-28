import { Marked } from "marked";
import { TextFormat } from "../api/types/chat";
import { UploadFileInfo } from "../misc/common";
import { ChatHistoryMessageContent } from "../database/ChatHistoryEntity";

const marked = new Marked();

namespace ChatHistoryMessageContentUtils {
    export function createChatHistoryMessageContent(text: string, files: UploadFileInfo[]): ChatHistoryMessageContent {
        const messageContent: ChatHistoryMessageContent = [{
            type: "text", text,
        }];

        for (const file of files) {
            messageContent.push({
                type: "image_url",
                image_url: {
                    url: `${file.dataUrlPrefix}${file.data}`,
                },
            });
        }
        return messageContent;
    }

    export function getMessageContentTextSync(messageContent: ChatHistoryMessageContent): string | null {
        for (const item of messageContent) {
            if (item.type === "text") {
                return item.text;
            }
        }
        return null;
    }

    export async function getAndConvertMessageContentText(messageContent: ChatHistoryMessageContent, contentTextFormat: TextFormat): Promise<string | null> {
        const text = getMessageContentText(messageContent);
        if (!text) {
            return null;
        }

        if (contentTextFormat === "markdown") {
            return (await marked.parse(text)) ?? text;
        } else {
            return text;
        }
    }

    export function getMessageContentText(messageContent: ChatHistoryMessageContent): string | null {
        for (const item of messageContent) {
            if (item.type === "text") {
                return item.text;
            }
        }
        return null;
    }

    export function getMessageContentImageUrl(messageContent: ChatHistoryMessageContent): string[] {
        const imageDataUrls: string[] = [];
        for (const item of messageContent) {
            if (item.type === "image_url") {
                imageDataUrls.push(item.image_url.url);
            }
        }
        return imageDataUrls;
    }

    export function appendToMessageContent(messageContent: ChatHistoryMessageContent, text: string): ChatHistoryMessageContent {
        for (const item of messageContent) {
            if (item.type === "text") {
                item.text += text;
                break;
            }
        }
        return messageContent;
    }
}

export default ChatHistoryMessageContentUtils;
