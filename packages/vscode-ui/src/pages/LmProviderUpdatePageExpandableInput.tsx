import React from 'react';
import { List, Stack } from '@fluentui/react';
import { Button, Checkbox, Input } from '@fluentui/react-components';
import { types } from 'aifoundry-vscode-shared';


type Props = {
    inputId: string;
    style: React.CSSProperties;
    models: types.api.LmProviderBaseModelInfo[];
    supportUserDefinedModels: boolean;
    llmFeature: types.api.LlmFeature;
    onChange: (modelUri: string, selected: boolean) => void;
    onAddUserDefinedModel: (modelName: string, llmFeature: types.api.LlmFeature) => void;
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

    return (<>
        <List items={items} onRenderCell={(item, index) => (
            <Checkbox
                key={item?.key ?? `checkbox-${index}`}
                label={item?.model.name ?? ""}
                checked={item?.model.selected ?? false} 
                onChange={(e) => item && onChange(item.key, e.target.checked)} 
            />
        )} />
        {props.supportUserDefinedModels && (<Stack horizontal>
            <Input placeholder="<model> or <model>:<version>" style={inputStyle} onChange={event => setModelName(event.target.value)} value={modelName} />
            <Button style={{ marginLeft: "8px" }} onClick={onAddUserDefinedModel}>Add</Button>
        </Stack>)}
    </>)
};

export default LmProviderUpdatePageExpandableInput;
