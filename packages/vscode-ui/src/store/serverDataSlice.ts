import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { types } from "aifoundry-vscode-shared";


interface ServerDataState {
    lmProviders: types.api.LmProviderInfoResponse[] | null;
    embeddings: types.database.EmbeddingMetadata[];
	functions: types.api.FunctionMetadata[];
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
        updateLmProviders: (state, action: PayloadAction<types.api.LmProviderInfoResponse[]>) => {
            state.lmProviders = action.payload;
        },
        updateEmbeddings: (state, action: PayloadAction<types.database.EmbeddingMetadata[]>) => {
            state.embeddings = action.payload;
        },
        updateFunctions: (state, action: PayloadAction<types.api.FunctionMetadata[]>) => {
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
