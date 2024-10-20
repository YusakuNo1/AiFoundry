type Status = "unknown" | "checking" | "available" | "unavailable";

export type SystemMenuItem = {
    id: string;
    name: string;
    status: string;
    weight: number;
    iconName: string;
};

// There are 3 stages for DockerSystemMenuItem
// 1. Not installed. `LmProviderInfo::status` is "unavailable"
// 2. Installed but not running. `LmProviderInfo::status` is "available", but `appStatus` is "unavailable"
// 3. Running. `LmProviderInfo::status` is "available", `appStatus` is "available" and `serverStatus` is "available"
export type DockerSystemMenuItem = SystemMenuItem & {
    appStatus: Status;
    serverStatus: Status;
};
