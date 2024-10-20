import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { api, database } from "aifoundry-vscode-shared";


interface ServerDataState {
    lmProviders: api.LmProviderInfoResponse[] | null;
    embeddings: database.EmbeddingMetadata[];
	functions: api.FunctionMetadata[];
}

const initialState: ServerDataState = {
    lmProviders: null,
    embeddings: [],
    functions: [],
};

export const serverDataSlice = createSlice({
    name: "serverData",
    initialState,
    reducers: {
        updateLmProviders: (state, action: PayloadAction<api.LmProviderInfoResponse[]>) => {
            state.lmProviders = action.payload;
        },
        updateEmbeddings: (state, action: PayloadAction<database.EmbeddingMetadata[]>) => {
            state.embeddings = action.payload;
        },
        updateFunctions: (state, action: PayloadAction<api.FunctionMetadata[]>) => {
            state.functions = action.payload;
        },
    },
});

export const {
    updateEmbeddings,
    updateFunctions,
    updateLmProviders,
} = serverDataSlice.actions;

export default serverDataSlice.reducer;
