const ApiOutputMessageTypes = ["info", "warning", "error", "success"] as const;
export type ApiOutputMessageType = typeof ApiOutputMessageTypes[number];
export type ApiOutputMessage = {
    type: ApiOutputMessageType;
    message: string;
}
