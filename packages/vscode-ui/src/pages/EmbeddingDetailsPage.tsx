import * as React from "react";
import { types } from "aifoundry-vscode-shared";
import BasePage from "./BasePage";

interface Props {
    data: types.api.EmbeddingInfo;
    onPostMessage: (message: types.IMessage) => void;
}

const EmbeddingDetailsPage: React.FC<Props> = (props: Props) => {
    const onPostMessage = React.useCallback((type: types.MessageEditInfoEmbeddingsType) => {
        const aifMessageType = "editInfo";
        if (type === "UpdateEmbeddingName") {
            const message: types.MessageEditInfoEmbeddingName = {
                aifMessageType,
                type,
                data: {
                    name: props.data.name,
                    aifEmbeddingAssetId: props.data.id,
                },
            };
            props.onPostMessage(message);    
        } else if (type === "UpdateEmbeddingDoc") {
            const message: types.MessageEditInfoEmbeddingUpdateDoc = {
                aifMessageType,
                type,
                data: {
                    aifEmbeddingAssetId: props.data.id,
                },
            };
            props.onPostMessage(message);
        } else if (type === "DeleteEmbedding") {
            const message: types.MessageEditInfoDeleteEmbedding = {
                aifMessageType,
                type,
                data: {
                    aifEmbeddingAssetId: props.data.id,
                },
            };
            props.onPostMessage(message);
        }
    }, [props]);

    if (!props.data) {
        // With React router, the page might be rendered before switching to the correct page
        return null;
    }

    return (
        <BasePage
            title="Embedding Details"
            columnStyles={[
                { width: "20%" },
                { width: "70%" },
                { width: "10%" },
            ]}
            rows={[
                { type: "label", key: "id", label: "ID", item: { name: props.data.id }},
                { type: "label", key: "name", label: "Name", item: { name: props.data.name ?? "", onClick: () => onPostMessage("UpdateEmbeddingName") }},
                { type: "label", key: "vs_provider", label: "Vector Store Provider", item: { name: props.data.vs_provider }},
                { type: "label", key: "model_uri", label: "Model URI", item: { name: props.data.basemodel_uri }},
            ]}
            actionButtons={[
                { key: "append-new-document", label: "Append New Document", onClick: () => onPostMessage("UpdateEmbeddingDoc") },
            ]}
        />
    )
};

export default EmbeddingDetailsPage;
