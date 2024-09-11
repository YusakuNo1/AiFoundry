import os, uuid
from typing import Any, Callable, List
from langchain_community.vectorstores import VectorStore
from langchain_community.vectorstores.faiss import FAISS
from langchain_community.vectorstores.chroma import Chroma
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from aif_types.embeddings import CreateOrUpdateEmbeddingsResponse, EmbeddingMetadata
from utils.assets_utils import get_embeddings_asset_path
from database.database_manager import DatabaseManager


def create_or_update_embeddings(asset_id: str | None, name: str, basemodel_uri: str, llm: Embeddings, documents: List[Document], database_manager: DatabaseManager) -> CreateOrUpdateEmbeddingsResponse:
    is_update = asset_id is not None

    if asset_id is None:
        asset_id = uuid.uuid4().hex
    else:
        vector_store = load_embeddings(asset_id, llm, None, database_manager)

    assets_path = get_embeddings_asset_path()
    aif_vs_provider = os.environ.get("VECTOR_STORE_PROVIDER")
    metadata = EmbeddingMetadata(name=name, vs_provider=aif_vs_provider, basemodel_uri=basemodel_uri, id=asset_id)

    if aif_vs_provider == "faiss":
        if not is_update:
            embeddings = FAISS.from_documents(documents, llm)
            FAISS.save_local(embeddings, assets_path, asset_id)
            database_manager.save_db_model(metadata)
        else:
            vector_store.add_documents(documents)
            FAISS.save_local(vector_store, assets_path, asset_id)
    elif aif_vs_provider == "chroma":
        # embeddings = Chroma.from_documents(documents, llm)
        # Chroma.save_local(embeddings, assets_path, asset_id)
        raise Exception("Not implemented")
    else:
        raise Exception("Invalid vector store provider")

    return CreateOrUpdateEmbeddingsResponse(asset_id=asset_id, name=name)


def load_embeddings(asset_id: str, llm: Embeddings | None, get_llm: Callable[[str], str ] | None, database_manager: DatabaseManager) -> VectorStore:
    if llm is None and get_llm is None:
        raise Exception("llm and llm_model_uri cannot be both None")
    
    embedding_metadata = database_manager.load_embeddings_metadata(asset_id=asset_id)

    if llm is None:
        llm = get_llm(embedding_metadata.basemodel_uri, is_embedding=True)

    assets_path = get_embeddings_asset_path()

    vs_provider = embedding_metadata.vs_provider
    if vs_provider == "faiss":
        return FAISS.load_local(folder_path=assets_path, embeddings=llm, index_name=asset_id, allow_dangerous_deserialization=True)
    elif vs_provider == "chroma":
        # return Chroma.load_local(assets_path, asset_id)
        raise Exception("Not implemented")
    else:
        raise Exception("Invalid vector store provider")


def delete_embedding(asset_id: str, database_manager: DatabaseManager):
    assets_path = get_embeddings_asset_path()
    embedding_metadata = database_manager.load_embeddings_metadata(asset_id=asset_id)
    vs_provider = embedding_metadata.vs_provider
    if vs_provider == "faiss":
        faiss_file_path = f"{assets_path}/{asset_id}.faiss"
        pkl_file_path = f"{assets_path}/{asset_id}.pkl"
        os.remove(faiss_file_path)
        os.remove(pkl_file_path)
    elif vs_provider == "chroma":
        raise Exception("Not implemented")
    else:
        raise Exception("Invalid vector store provider")

    database_manager.delete_embeddings_metadata(asset_id)
