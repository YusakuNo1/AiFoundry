import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { api, database } from "aifoundry-vscode-shared";


interface ServerDataState {
    lmProviders: api.LmProviderInfoResponse[] | null;
    embeddings: database.EmbeddingEntity[];
	functions: api.FunctionEntity[];
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
        updateEmbeddings: (state, action: PayloadAction<database.EmbeddingEntity[]>) => {
            state.embeddings = action.payload;
        },
        updateFunctions: (state, action: PayloadAction<api.FunctionEntity[]>) => {
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
