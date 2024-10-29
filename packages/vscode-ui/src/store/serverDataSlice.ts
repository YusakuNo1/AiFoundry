import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { type api } from "aifoundry-vscode-shared";


interface ServerDataState {
    agents: api.AgentEntity[] | null;
    embeddings: api.EmbeddingEntity[] | null;
	functions: api.FunctionEntity[] | null;
    lmProviders: api.LmProviderInfoResponse[] | null;
}

const initialState: ServerDataState = {
    agents: null,
    embeddings: null,
    functions: null,
    lmProviders: null,
};

export const serverDataSlice = createSlice({
    name: "serverData",
    initialState,
    reducers: {
        updateAgents: (state, action: PayloadAction<api.AgentEntity[]>) => {
            state.agents = action.payload;
        },
        updateEmbeddings: (state, action: PayloadAction<api.EmbeddingEntity[]>) => {
            state.embeddings = action.payload;
        },
        updateFunctions: (state, action: PayloadAction<api.FunctionEntity[]>) => {
            state.functions = action.payload;
        },
        updateLmProviders: (state, action: PayloadAction<api.LmProviderInfoResponse[]>) => {
            state.lmProviders = action.payload;
        },
    },
});

export const {
    updateAgents,
    updateEmbeddings,
    updateFunctions,
    updateLmProviders,
} = serverDataSlice.actions;

export default serverDataSlice.reducer;
