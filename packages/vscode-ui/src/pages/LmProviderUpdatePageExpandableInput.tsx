import React from 'react';
import { List, Stack } from '@fluentui/react';
import { Button, Checkbox, Input } from '@fluentui/react-components';
import { consts, types } from 'aifoundry-vscode-shared';
import { themeName } from '../theme/themes';
import { AifIcons } from '../theme/icons';


type Props = {
    lmProviderId: string;
    inputId: string;
    style: React.CSSProperties;
    models: types.api.LmProviderBaseModelInfo[];
    supportUserDefinedModels: boolean;
    llmFeature: types.api.LlmFeature;
    onChange: (modelUri: string, selected: boolean) => void;
    onAddUserDefinedModel: (modelName: string, llmFeature: types.api.LlmFeature) => void;
    onDownloadModel: (modelUri: string) => void;
    onDeleteModel: (modelUri: string) => void;
}
const LmProviderUpdatePageExpandableInput = (props: Props) => {
    const [modelName, setModelName] = React.useState<string>("");
    const [modelMap, setModelMap] = React.useState<Record<string, types.api.LmProviderBaseModelInfo>>({});

    React.useEffect(() => {
        const map: Record<string, types.api.LmProviderBaseModelInfo> = {};
        for (const model of props.models) {
            if (props.llmFeature === "all" || model.features.includes(props.llmFeature)) {
                map[model.name] = model;
            }
        }
        setModelMap(map);
    }, [props.models, props.llmFeature]);
    const items = React.useMemo(() => Object.entries(modelMap).map(([key, model]) => ({ key, model })).sort(), [modelMap]);

    const onChange = React.useCallback((key: string, checked: boolean) => {
        if (!modelMap[key]) {
            return;
        }

        const newModelMap = {
            ...modelMap,
            [key]: {
                ...modelMap[key],
                selected: checked,
            },
        };
        setModelMap(newModelMap);
        props.onChange(modelMap[key].uri, checked);
    }, [modelMap, props]);

    const onAddUserDefinedModel = React.useCallback((event: any) => {
        if (modelName.trim() === "") {
            return;
        }
        props.onAddUserDefinedModel(modelName, props.llmFeature);
        setModelName("");
    }, [props, modelName]);

    const inputStyle = { width: "100%" };

    const renderLabel = (model: types.api.LmProviderBaseModelInfo | null, isDownloaded: boolean) => {
        if (!model) {
            return null;
        } else {
            return (
                <div>
                    {model.name}
                    &nbsp;&nbsp;
                    {!isDownloaded && <Button onClick={() => props.onDownloadModel(model.uri)}>Download</Button>}
                    {isDownloaded  && <Button onClick={() => props.onDeleteModel(model.uri)}>Delete</Button>}
                </div>
            );    
        }
    }

    return (<>
        <List items={items} onRenderCell={(item, index) => {
            const isDownloaded = props.lmProviderId === consts.LOCAL_LM_PROVIDER_ID_OLLAMA && ((item?.model as types.api.LmProviderBaseModelInfoOllama)?.isDownloaded ?? false);
            return (<Checkbox
                disabled={!isDownloaded}
                key={item?.key ?? `checkbox-${index}`}
                label={renderLabel(item?.model ?? null, isDownloaded)}
                checked={item?.model.selected ?? false} 
                onChange={(e) => item && onChange(item.key, e.target.checked)} 
            />)}} />
        {props.supportUserDefinedModels && (<Stack horizontal>
            <Input placeholder="<model> or <model>:<version>" style={inputStyle} onChange={event => setModelName(event.target.value)} value={modelName} />
            <Button style={{ marginLeft: "8px" }} onClick={onAddUserDefinedModel}>Add</Button>
        </Stack>)}
    </>)
};

export default LmProviderUpdatePageExpandableInput;
