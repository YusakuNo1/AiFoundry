namespace Config {
    export const SERVER_PORT = 30303;
    export const VECTOR_STORE_PROVIDER = "faiss";
    export const SQLITE_FOLDER_NAME = "aifdb";

    export const ADMIN_CTRL_PREFIX = "/admin";
    export const DEFAULT_MODEL_WEIGHT = 100;
    
    // Headers and cookies used in the AIFoundry API
    export const HEADER_AIF_AGENT_URI = "aif-agent-uri";
    export const HEADER_AIF_BASEMODEL_URI = "aif-basemodel-uri";
    export const HEADER_AIF_EMBEDDING_ASSET_ID = "aif-embedding-asset-id";
    export const COOKIE_AIF_SESSION_ID = "aif-session-id";
    
    // Files and folders used in the AIFoundry server
    export const AIFOUNDRY_LOCAL_SERVER_FOLDER_NAME = ".aifoundry";
    export const ASSETS_FOLDER_NAME = "assets";
    export const FUNCTIONS_FOLDER_NAME = "functions";
    export const EMBEDDINGS_FOLDER_NAME = "embeddings";
    
    // Linkbreak for the response, not sure why "\n" is not working
    export const RESPONSE_LINEBREAK = "<br />";    
}

export default Config;
