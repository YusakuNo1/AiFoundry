import * as React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { type api, type messages } from "aifoundry-vscode-shared";
import BasePage from "./BasePage";

interface Props {
    onPostMessage: (message: messages.IMessage) => void;
}

const EmbeddingDetailsPage: React.FC<Props> = (props: Props) => {
    const embeddingId: string | null = useSelector((state: RootState) => state.serverData.embeddingId);
    const embeddings: api.EmbeddingEntity[] = useSelector((state: RootState) => state.serverData.embeddings);

    React.useEffect(() => {
        const message: messages.MessageApiGetEmbeddings = {
            aifMessageType: "api",
            type: "api:getEmbeddings",
            data: {},
        };
        props.onPostMessage(message);
    }, [props]);

    const embedding = React.useMemo(() => {
        return embeddings.find((e) => e.id === embeddingId);
    }, [embeddingId, embeddings]);

    const onPostMessage = React.useCallback((type: messages.MessageEditInfoEmbeddingsType) => {
        if (!embedding) {
            return;
        }

        const aifMessageType = "editInfo";
        const aifEmbeddingAssetId = embedding.id;
        if (type === "UpdateEmbeddingName") {
            const message: messages.MessageEditInfoEmbeddingName = {
                aifMessageType,
                type,
                data: {
                    aifEmbeddingAssetId,
                    name: embedding.name,
                },
            };
            props.onPostMessage(message);    
        } else if (type === "UpdateEmbeddingDoc") {
            const message: messages.MessageEditInfoEmbeddingUpdateDoc = {
                aifMessageType,
                type,
                data: { aifEmbeddingAssetId },
            };
            props.onPostMessage(message);
        } else if (type === "DeleteEmbedding") {
            const message: messages.MessageEditInfoDeleteEmbedding = {
                aifMessageType,
                type,
                data: { aifEmbeddingAssetId },
            };
            props.onPostMessage(message);
        } else if (type === "UpdateEmbeddingSearchTopK") {
            const message: messages.MessageEditInfoEmbeddingSearchTopK = {
                aifMessageType,
                type,
                data: {
                    aifEmbeddingAssetId,
                    searchTopK: embedding.searchTopK,
                },
            };
            props.onPostMessage(message);
        }
    }, [props, embedding]);

    if (!embedding) {
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
                // { type: "label", key: "id", label: "ID", item: { name: embedding.id }},
                { type: "label", key: "name", label: "Name", item: { name: embedding.name ?? "", onClick: () => onPostMessage("UpdateEmbeddingName") }},
                { type: "label", key: "model_uri", label: "Model URI", item: { name: embedding.basemodelUri }},
                { type: "label", key: "vectorStoreProvider", label: "Vector Store Provider", item: { name: embedding.vectorStoreProvider }},
                { type: "label", key: "chunk_size", label: "Embedding Chunk Size", item: { name: embedding.splitterParams.chunkSize }},
                { type: "label", key: "chunk_overlap", label: "Embedding Chunk Overlap", item: { name: embedding.splitterParams.chunkOverlap }},
                { type: "label", key: "search_top_k", label: "Search Range", item: { name: embedding.searchTopK, onClick: () => onPostMessage("UpdateEmbeddingSearchTopK") }},
            ]}
            actionButtons={[
                { key: "append-new-document", label: "Append New Document", onClick: () => onPostMessage("UpdateEmbeddingDoc") },
            ]}
        />
    )
};

export default EmbeddingDetailsPage;
