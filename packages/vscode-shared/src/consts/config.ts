export const AifConfigKeyPrefix = "aif-config-";

export enum AifConfig {
    mode = "mode",
    homedir = "homedir",
}

export namespace AppConfig {
    export const MODE: "dev" | "prod" = "prod";
    export const USE_DOCKER = false; // The old Python server is using Docker
    export const ENABLE_FUNCTIONS = false; // TODO: JS server didn't support functions for now
}

export const THUMBNAIL_HEIGHT = 100;
export const UPLOAD_IMAGE_MAX_WIDTH = 800;
export const UPLOAD_IMAGE_MAX_HEIGHT = 600;
export const LM_PROVIDER_PROP_VALUE_MASK = "*";
