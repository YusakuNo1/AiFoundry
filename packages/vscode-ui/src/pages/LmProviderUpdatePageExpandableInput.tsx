import React from 'react';
import { List, Stack } from '@fluentui/react';
import { Button, Input, Label } from '@fluentui/react-components';
import { type api, consts } from 'aifoundry-vscode-shared';


type Props = {
    lmProviderId: string;
    inputId: string;
    style: React.CSSProperties;
    models: api.LmProviderBaseModelInfo[];
    supportUserDefinedModels: boolean;
    llmFeature: api.LlmFeature;
    onChange: (modelUri: string, selected: boolean) => void;
    onAddUserDefinedModel: (modelName: string, llmFeature: api.LlmFeature) => void;
    onDownloadModel: (modelUri: string) => void;
    onDeleteModel: (modelUri: string) => void;
}
const LmProviderUpdatePageExpandableInput = (props: Props) => {
    const [modelName, setModelName] = React.useState<string>("");
    const [modelMap, setModelMap] = React.useState<Record<string, api.LmProviderBaseModelInfo>>({});
    const isLocalLmProvider = React.useMemo(() => consts.LOCAL_LM_PROVIDERS.includes(props.lmProviderId), [props.lmProviderId]);

    React.useEffect(() => {
        const map: Record<string, api.LmProviderBaseModelInfo> = {};
        for (const model of props.models) {
            if (props.llmFeature === "all" || model.features.includes(props.llmFeature)) {
                map[model.name] = model;
            }
        }
        setModelMap(map);
    }, [props.models, props.llmFeature]);
    const items = React.useMemo(() => Object.entries(modelMap).map(([key, model]) => ({ key, model })).sort(), [modelMap]);

    const onAddUserDefinedModel = React.useCallback((event: any) => {
        if (modelName.trim() === "") {
            return;
        }
        props.onAddUserDefinedModel(modelName, props.llmFeature);
        setModelName("");
    }, [props, modelName]);

    const inputStyle = { width: "100%" };

    const renderLabel = (model: api.LmProviderBaseModelInfo | null, isDownloaded: boolean) => {
        if (!model) {
            return null;
        } else if (!isLocalLmProvider) {
            return (
                <div style={{ marginTop: "8px", marginBottom: "8px" }}>
                    <Label disabled={!isDownloaded}>{model.name}</Label>
                </div>
            );
        } else {
            return (
                <div style={{ marginTop: "4px", marginBottom: "4px" }}>
                    {!isDownloaded && <Button onClick={() => props.onDownloadModel(model.uri)}>Download</Button>}
                    {isDownloaded  && <Button onClick={() => props.onDeleteModel(model.uri)}>Delete</Button>}
                    &nbsp;&nbsp;
                    <Label disabled={!isDownloaded}>{model.name}</Label>
                </div>
            );    
        }
    }

    return (<>
        <List items={items} onRenderCell={(item, index) => {
            const isDownloaded = !isLocalLmProvider || ((item?.model as api.LmProviderBaseModelLocalInfo)?.isDownloaded ?? false);
            return renderLabel(item?.model ?? null, isDownloaded);
        }} />
        {props.supportUserDefinedModels && (<Stack style={{ marginTop: "4px", marginBottom: "4px" }} horizontal>
            <Input placeholder="<model> or <model>:<version>" style={inputStyle} onChange={event => setModelName(event.target.value)} value={modelName} />
            <Button style={{ marginLeft: "8px" }} onClick={onAddUserDefinedModel}>Add</Button>
        </Stack>)}
    </>)
};

export default LmProviderUpdatePageExpandableInput;
