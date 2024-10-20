import * as shared from "./shared";

export const MessageHostMsgTypes = ['executeCommand', "showMessage"] as const;
export type MessageHostMsg = shared.IMessage & {
    aifMessageType: "hostMsg",
    type: typeof MessageHostMsgTypes[number],
};
export type MessageHostMsgExecuteCommand = MessageHostMsg & {
    type: 'executeCommand',
    data: {
        command: 'AiFoundry.installDocker' |
            'AiFoundry.startDockerApp' |
            'AiFoundry.startDockerServer' |
            'AiFoundry.startDockerDevContainer' |
            'AiFoundry.refreshMainView' |
            'AiFoundry.refreshAllViews', // List of available commands
        args: Record<string, any>,
    }
}
export type MessageHostMsgShowMessage = MessageHostMsg & {
    type: 'showMessage',
    data: {
        type: "error" | "warning" | "info",
        message: string,
    }
}
