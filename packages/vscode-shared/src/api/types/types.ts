const ApiOutStreamMessageTypes = ["info", "warning", "error", "success"] as const;
export type ApiOutStreamMessageType = typeof ApiOutStreamMessageTypes[number];
export type ApiOutStreamMessage = {
    type: ApiOutStreamMessageType;
    message: string;
}

export const LlmFeatures = ["all", "conversational", "vision", "embedding", "tools"] as const;
export type LlmFeature = typeof LlmFeatures[number];
