import React from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { RootState } from '../store/store';
import HomePage from '../pages/HomePage';
import EmbeddingDetailsPage from '../pages/EmbeddingDetailsPage';
import AgentDetailsPage from '../pages/AgentDetailsPage';
import ModelPlaygroundPage from '../pages/ModelPlaygroundPage';
import FunctionDetailsPage from '../pages/FunctionDetailsPage';
import LmProviderUpdatePage from '../pages/LmProviderUpdatePage';
import Layout from './Layout';
import AppBreadcrumb from './AppBreadcrumb';
import AppNavigator from './AppNavigator';
import type { VSCodeInterface } from '../types';

function AppContent(props: { vscode: VSCodeInterface }) {
    const pageType = useSelector((state: RootState) => state.pageInfo.pageType);

    return (<>
        <AppNavigator />

        <AppBreadcrumb pageType={pageType} />

        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path="agents/:agentId" element={<AgentDetailsPage onPostMessage={props.vscode.postMessage} />} />
                <Route path="embeddings/:embeddingId" element={<EmbeddingDetailsPage onPostMessage={props.vscode.postMessage} />} />
                <Route path="functions/:functionId" element={<FunctionDetailsPage onPostMessage={props.vscode.postMessage} />} />
                <Route path="modelPlayground" element={<ModelPlaygroundPage onPostMessage={props.vscode.postMessage} />} />
                <Route path="updateLmProvider/:lmProviderId" element={<LmProviderUpdatePage onPostMessage={props.vscode.postMessage} />} />
                <Route path="*" element={<HomePage vscode={props.vscode} />} />
            </Route>
        </Routes>
    </>)
}

export default AppContent;
