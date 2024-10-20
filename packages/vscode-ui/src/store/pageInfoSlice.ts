import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import type { RootState } from "./store";
import type { messages } from "aifoundry-vscode-shared";

interface PageInfoState {
    pageContext: messages.IPageContext;
}

const initialState: PageInfoState = {
    pageContext: {
        pageType: "home",
    },
};

export const pageInfoSlice = createSlice({
    name: "pageInfo",
    initialState,
    reducers: {
        setPageContext: (state, action: PayloadAction<messages.IPageContext>) => {
            state.pageContext = action.payload;
        },
    },
});

export const { setPageContext } = pageInfoSlice.actions;

// export const selectCount = (state: RootState) => state.pageInfo.value;

export default pageInfoSlice.reducer;
