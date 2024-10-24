const ApiOutStreamMessageTypes = ["info", "warning", "error", "success"] as const;
export type ApiOutStreamMessageType = typeof ApiOutStreamMessageTypes[number];
export type ApiOutStreamMessage = {
    type: ApiOutStreamMessageType;
    message: string;
}
