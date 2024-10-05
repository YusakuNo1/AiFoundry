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
    onChange: (models: types.api.LmProviderBaseModelInfo[]) => void;
    onAddUserDefinedModel: (modelName: string, llmFeature: types.api.LlmFeature) => void;
}
const LmProviderUpdatePageExpandableInput = (props: Props) => {
    const [modelName, setModelName] = React.useState<string>("");
    const [modelMap, setModelMap] = React.useState<Record<string, types.api.LmProviderBaseModelInfo>>({});
    const [excludedModels, setExcludedModels] = React.useState<types.api.LmProviderBaseModelInfo[]>([]);

    React.useEffect(() => {
        const map: Record<string, types.api.LmProviderBaseModelInfo> = {};
        const _excludedModels: types.api.LmProviderBaseModelInfo[] = [];
        const embeddingTag: types.api.LlmFeature = "embedding";
        for (const model of props.models) {
            const shouldInclude = props.llmFeature === "all" || 
                (props.llmFeature === "conversational" && !model.tags.includes(embeddingTag)) || // Conversational models are not embedding models
                (props.llmFeature !== "conversational" && model.tags.includes(embeddingTag));

            if (shouldInclude) {
                map[model.name] = model;
            } else {
                _excludedModels.push(model);
            }
        }
        setExcludedModels(_excludedModels);
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

        props.onChange([ ...Object.values(newModelMap), ...excludedModels ]);
    }, [modelMap, props, excludedModels]);

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
