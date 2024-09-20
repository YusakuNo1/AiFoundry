import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { types } from "aifoundry-vscode-shared";


interface ServerDataState {
    lmProviders: types.api.LmProviderInfo[] | null;
    systemMenuItemMap: Record<string, types.SystemMenuItem>;
    embeddings: types.api.EmbeddingInfo[];
	functions: types.api.FunctionMetadata[];
}

const initialState: ServerDataState = {
    lmProviders: null,
    systemMenuItemMap: {},
    embeddings: [],
    functions: [],
};

export const serverDataSlice = createSlice({
    name: "serverData",
    initialState,
    reducers: {
        updateLmProviders: (state, action: PayloadAction<types.api.LmProviderInfo[]>) => {
            state.lmProviders = action.payload;
        },
        updateSystemMenuItemMap: (state, action: PayloadAction<{ systemMenuItemMap: Record<string, types.SystemMenuItem> }>) => {
            for (const key in action.payload.systemMenuItemMap) {
                state.systemMenuItemMap[key] = action.payload.systemMenuItemMap[key];
            }
        },
        updateEmbeddings: (state, action: PayloadAction<types.api.EmbeddingInfo[]>) => {
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
    updateSystemMenuItemMap,
} = serverDataSlice.actions;

export default serverDataSlice.reducer;
