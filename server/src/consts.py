# Config
ADMIN_CTRL_PREFIX: str = '/admin'
DEFAULT_MODEL_WEIGHT = 100

# Headers and cookies used in the AIFoundry API
HEADER_AIF_AGENT_URI = "aif-agent-uri"
HEADER_AIF_BASEMODEL_URI = "aif-basemodel-uri"
HEADER_AIF_EMBEDDING_ASSET_ID = "aif-embedding-asset-id"
COOKIE_AIF_SESSION_ID = "aif-session-id"

# Files and folders used in the AIFoundry server
AIFOUNDRY_LOCAL_SERVER_FOLDER_NAME = ".aifoundry"
ASSETS_FOLDER_NAME = "assets"
FUNCTIONS_FOLDER_NAME = "functions"
EMBEDDINGS_FOLDER_NAME = "embeddings"

# Linkbreak for the response, not sure why "\n" is not working
RESPONSE_LINEBREAK = "<br />"

IMAGE_EXTENSION_INFO = {
    "jpeg": {
        "format": "jpeg",
        "mime_type": "image/jpeg",
    },
    "jpg": {
        "format": "jpeg",
        "mime_type": "image/jpeg",
    },
    "png": {
        "format": "png",
        "mime_type": "image/png",
    },
    "gif": {
        "format": "gif",
        "mime_type": "image/gif",
    },
}
