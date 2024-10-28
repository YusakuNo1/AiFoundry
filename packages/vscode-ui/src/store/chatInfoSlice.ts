import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api, ChatHistoryMessageContentUtils } from "aifoundry-vscode-shared";


interface ChatInfoState {
    aifSessionId: string | null;
    aifAgentUri: string | null;
    outputFormat: api.TextFormat;
    messages: api.ChatHistoryMessage[];
}

const initialState: ChatInfoState = {
    aifSessionId: null,
    aifAgentUri: null,
    outputFormat: "plain",
    messages: [],
};

export const chatInfoSlice = createSlice({
    name: "chatInfo",
    initialState,
    reducers: {
        reset: (state) => {
            state.aifSessionId = null;
            state.messages = [];
        },
        initPlayground: (state, action: PayloadAction<{ aifAgentUri: string, outputFormat: api.TextFormat }>) => {
            state.aifAgentUri = action.payload.aifAgentUri;
            state.outputFormat = action.payload.outputFormat;
        },
        setChatHistory: (state, action: PayloadAction<api.ChatHistoryEntity>) => {
            state.aifSessionId = action.payload.id;
            state.messages = action.payload.messages;
        },
        appendChatUserMessage: (state, action: PayloadAction<{
            content: api.ChatHistoryMessageContent,
            contentTextFormat: api.TextFormat,
        }>) => {
            // For user chat message, always append it since it's from local, we have no session ID
            state.messages.push({
                role: api.ChatRole.USER,
                content: action.payload.content,
                contentTextFormat: action.payload.contentTextFormat,
            });
        },

        // For non-streaming, append chat assistant message
        appendChatAssistantMessage: (state, action: PayloadAction<{
            aifSessionId: string,
            content: api.ChatHistoryMessageContent,
            contentTextFormat: api.TextFormat,
        }>) => {
            if (state.aifSessionId === null) {
                state.aifSessionId = action.payload.aifSessionId;
            }

            state.messages.push({
                role: api.ChatRole.ASSISTANT,
                content: action.payload.content,
                contentTextFormat: "plain",
            });
        },

        // For streaming, append chunks to the last chat assistant message
        appendToLastChatAssistantMessage: (state, action: PayloadAction<{ aifSessionId: string, chunk: string, contentTextFormat: api.TextFormat }>) => {
            if (state.aifSessionId === null) {
                state.aifSessionId = action.payload.aifSessionId;
            }

            // If last message is user message, or the messages list empty, append new message
            if (state.messages.length === 0 || state.messages[state.messages.length - 1].role === api.ChatRole.USER) {
                state.messages.push({
                    role: api.ChatRole.ASSISTANT,
                    content: [{
                        type: "text",
                        text: action.payload.chunk,
                    }],
                    contentTextFormat: action.payload.contentTextFormat,
                });
            } else {
                const lastMessage = state.messages[state.messages.length - 1];
                state.messages = [
                    ...state.messages.slice(0, state.messages.length - 1),
                    {
                        role: api.ChatRole.ASSISTANT,
                        content: ChatHistoryMessageContentUtils.appendToMessageContent(lastMessage.content, action.payload.chunk),
                        contentTextFormat: action.payload.contentTextFormat,
                    },
                ]
            }
        },
        // For streaming, append chunks to the last chat assistant message
        updateLastChatAssistantMessage: (state, action: PayloadAction<{ aifSessionId: string, content: api.ChatHistoryMessageContent, contentTextFormat: api.TextFormat }>) => {
            if (state.aifSessionId === null) {
                state.aifSessionId = action.payload.aifSessionId;
            }

            // If last message is user message, or the messages list empty, append new message
            if (state.messages.length === 0 || state.messages[state.messages.length - 1].role === api.ChatRole.USER) {
                state.messages.push({
                    role: api.ChatRole.ASSISTANT,
                    content: action.payload.content,
                    contentTextFormat: action.payload.contentTextFormat,
                });
            } else {
                state.messages = [
                    ...state.messages.slice(0, state.messages.length - 1),
                    {
                        role: api.ChatRole.ASSISTANT,
                        content: ChatHistoryMessageContentUtils.appendToMessageContent(
                            state.messages[state.messages.length - 1].content,
                            ChatHistoryMessageContentUtils.getMessageContentText(action.payload.content) ?? "",
                        ),
                        contentTextFormat: action.payload.contentTextFormat,
                    },
                ]
            }

        },
    },
});

export const {
    reset,
    initPlayground,
    setChatHistory,
    appendChatAssistantMessage,
    appendChatUserMessage,
    appendToLastChatAssistantMessage,
    updateLastChatAssistantMessage,
} = chatInfoSlice.actions;

export default chatInfoSlice.reducer;
