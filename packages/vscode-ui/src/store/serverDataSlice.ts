import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { type api } from "aifoundry-vscode-shared";


interface ServerDataState {
    agentId: string | null;
    embeddingId: string | null,
    functionId: string | null;
    lmProviderId: string | null;
    agents: api.AgentEntity[];
    embeddings: api.EmbeddingEntity[];
	functions: api.FunctionEntity[];
    lmProviders: api.LmProviderInfoResponse[];
}

const initialState: ServerDataState = {
    agentId: null,
    embeddingId: null,
    functionId: null,
    lmProviderId: null,
    agents: [],
    embeddings: [],
    functions: [],
    lmProviders: [],
};

export const serverDataSlice = createSlice({
    name: "serverData",
    initialState,
    reducers: {
        setAgentId: (state, action: PayloadAction<string>) => {
            state.agentId = action.payload;
        },
        setEmbeddingId: (state, action: PayloadAction<string>) => {
            state.embeddingId = action.payload;
        },
        setFunctionId: (state, action: PayloadAction<string>) => {
            state.functionId = action.payload;
        },
        setLmProviderId: (state, action: PayloadAction<string>) => {
            state.lmProviderId = action.payload;
        },
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
    setAgentId,
    setEmbeddingId,
    setFunctionId,
    setLmProviderId,
    updateAgents,
    updateEmbeddings,
    updateFunctions,
    updateLmProviders,
} = serverDataSlice.actions;

export default serverDataSlice.reducer;
