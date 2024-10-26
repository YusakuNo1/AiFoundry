import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import type { RootState } from "./store";
import type { messages } from "aifoundry-vscode-shared";

interface PageInfoState {
    pageType: messages.IPageContextPageType;
    pageContext: messages.IPageContext;
}

const initialState: PageInfoState = {
    pageType: "home",
    pageContext: {
        pageType: "home",
    },
};

export const pageInfoSlice = createSlice({
    name: "pageInfo",
    initialState,
    reducers: {
        setPageType: (state, action: PayloadAction<messages.IPageContextPageType>) => {
            state.pageType = action.payload;
        },
        setPageContext: (state, action: PayloadAction<messages.IPageContext>) => {
            state.pageContext = action.payload;
        },
    },
});

export const {
    setPageType,
    setPageContext,
} = pageInfoSlice.actions;

// export const selectCount = (state: RootState) => state.pageInfo.value;

export default pageInfoSlice.reducer;
