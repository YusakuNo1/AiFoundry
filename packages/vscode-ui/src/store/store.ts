import { configureStore } from "@reduxjs/toolkit";
import pageInfoSlice from "./pageInfoSlice";
import chatInfoSlice from "./chatInfoSlice";
import serverDataSlice from "./serverDataSlice";

export const store = configureStore({
    reducer: {
        pageInfo: pageInfoSlice,
        chatInfo: chatInfoSlice,
        serverData: serverDataSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
