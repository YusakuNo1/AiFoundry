import React from 'react';
import type { types } from 'aifoundry-vscode-shared';

export const PageContext = React.createContext<types.IPageContext | { data: any }>({
    pageType: "home",
    data: null,
});
