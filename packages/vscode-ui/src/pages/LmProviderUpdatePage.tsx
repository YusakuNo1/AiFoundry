import React from 'react';
import { useSelector } from 'react-redux';
import { Input, Label, Table, TableCell, TableHeader, TableRow, TableHeaderCell, TableBody } from '@fluentui/react-components';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { consts, types } from 'aifoundry-vscode-shared';
import { RootState } from '../store/store';
import { getTextColor } from '../Theme';
import LmProviderUpdatePageExpandableInput from './LmProviderUpdatePageExpandableInput';
import LmProviderUpdatePageOllama from './LmProviderUpdatePageOllama';
import { AifExperiments } from '../consts';


type Props = {
    lmProviderId: string;
    onPostMessage: (message: types.IMessage) => void;
}
const LmProviderUpdatePage = (props: Props) => {
    const textColor = React.useMemo(() => getTextColor(), []);
    const lmProviders = useSelector((state: RootState) => state.serverData.lmProviders);
    const systemMenuItemMap = useSelector((state: RootState) => state.serverData.systemMenuItemMap);
    const systemMenuItem = systemMenuItemMap[props.lmProviderId];

    const [provider, setProvider] = React.useState<types.api.LmProviderInfo | null>(null);
    const [properties, setProperties] = React.useState<Record<string, types.api.LmProviderProperty>>({});
    const [weight, setWeight] = React.useState<string>("");
    const [models, setModels] = React.useState<types.api.LmProviderBaseModelInfo[]>([]);

    React.useEffect(() => {
        if (!lmProviders) {
            const message: types.MessageApiListLmProviders = {
                aifMessageType: "api",
                type: "listLmProviders",
                data: {},
            };
            props.onPostMessage(message);
        }
    }, [lmProviders, props]);

    React.useEffect(() => {
        if (!lmProviders) {
            return;
        }

        for (const lmProvider of lmProviders) {
            if (lmProvider.lmProviderId === props.lmProviderId) {
                const _patchedProperties: Record<string, types.api.LmProviderProperty> = {};
                for (const key of Object.keys(lmProvider.properties)) {
                    const property = lmProvider.properties[key];
                    _patchedProperties[key] = {
                        ...property,
                        value: property.isCredential ? null : property.value,
                        // Use either hint, or the "value" as hint for credential properties, because the value will be "*****" for credentials
                        hint: (property.isCredential && property.hint.length === 0 && property.value && property.value?.length > 0) ? property.value : property.hint,
                    };
                }

                setProvider(lmProvider);
                setProperties(_patchedProperties);
                setWeight("" + lmProvider.weight);
                setModels(lmProvider.models);
            }
        }
    }, [lmProviders, props.lmProviderId]);


    const onSubmit = React.useCallback(() => {
        const _properties: Record<string, string> = {};
        for (const id of Object.keys(properties)) {
            if (properties[id].value) {
                _properties[id] = properties[id].value!;
            }
        }
        const _weight = parseInt(weight) ?? null;
        const _selectedModels = models.filter(model => model.selected);

        const embeddingTag: types.api.LlmFeature = "embedding";
        const visionTag: types.api.LlmFeature = "vision";
        const toolsTag: types.api.LlmFeature = "tools";
        const _embeddingModelIndexes: number[] = [];
        const _visionModelIndexes: number[] = [];
        const _toolsModelIndexes: number[] = [];
        for (const model of _selectedModels) {
            if (model.tags.includes(embeddingTag)) {
                _embeddingModelIndexes.push(_selectedModels.indexOf(model));
            }
            if (model.tags.includes(visionTag)) {
                _visionModelIndexes.push(_selectedModels.indexOf(model));
            }
            if (model.tags.includes(toolsTag)) {
                _toolsModelIndexes.push(_selectedModels.indexOf(model));
            }
        }

        const request: types.api.UpdateLmProviderRequest = {
            lmProviderId: props.lmProviderId,
            properties: _properties,
            weight: _weight,
            selectedModels: _selectedModels.map(model => model.id),
            embeddingModelIndexes: _embeddingModelIndexes,
            visionModelIndexes: _visionModelIndexes,
            toolsModelIndexes: _toolsModelIndexes,
        };

        const message: types.MessageApiUpdateLmProvider = {
            aifMessageType: "api",
            type: "updateLmProvider",
            data: request,
        };
        props.onPostMessage(message);
    }, [props, properties, weight, models]);

    const onCancel = React.useCallback(() => {
        const message: types.MessageSetPageContext = {
            aifMessageType: "setPageType",
            pageType: "home",
        };
        window.postMessage(message);
    }, []);

    const onChangeProperty = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newProperties = {
            ...properties,
            [event.target.id]: {
                ...properties[event.target.id],
                value: event.target.value,
            }
        };
        setProperties(newProperties);
    }, [properties]);

    const onChangeWeight = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setWeight(event.target.value);
    }, [setWeight]);

    const onChangeModels = React.useCallback((selectedModels: types.api.LmProviderBaseModelInfo[]) => {
        setModels(selectedModels);
    }, [setModels]);

    const onAddUserDefinedModel = React.useCallback((modelName: string, llmFeature: types.api.LlmFeature) => {
        const newModel: types.api.LmProviderBaseModelInfo = {
            id: modelName,
            selected: true,
            isUserDefined: true,
            tags: [llmFeature],
        };
        setModels([...models, newModel]);
    }, [models, setModels]);

    function renderRow(name: string, valueElement: React.ReactElement | string | number | undefined, descriptionElement: React.ReactElement | string) {
        return (<TableRow key={name}>
            <TableCell>{name}</TableCell>
            <TableCell>{valueElement}</TableCell>
            <TableCell>{descriptionElement}</TableCell>
        </TableRow>);
    }

    const inputStyle = { width: "100%" };
    const showOllamaSetup = provider?.lmProviderId === consts.LOCAL_LM_PROVIDER_ID_OLLAMA && systemMenuItem?.status === "unavailable";
    const tableBodyStyle = {
        width: "100%",
        ...(showOllamaSetup ? { height: "64px" } : {}),
    };

    if (!provider) {
        return null;
    } else {
        return (<>
            <Table arial-label="lm-provider-setup-table">
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell key="lm-provider-setup-table-header" colSpan={3}>
                            <Label style={{ color: textColor }} size='large'>{`Setup ${provider.name}`}</Label>
                        </TableHeaderCell>
                    </TableRow>
                </TableHeader>
                <TableBody style={tableBodyStyle}>
                    {showOllamaSetup && <LmProviderUpdatePageOllama />}
                    {!showOllamaSetup && <>
                        {Object.keys(properties ?? {}).map((id) => {
                            const property = properties[id];
                            if (property.isCredential) {
                                const placeholder = property.hint;
                                return renderRow(id, <Input id={id} type="password" placeholder={placeholder} onChange={onChangeProperty} style={inputStyle} />, property.description);
                            } else {
                                const value = property.value ?? undefined;
                                return renderRow(id, <Input id={id} value={value} onChange={onChangeProperty} style={inputStyle} />, property.description);
                            }
                        })}
                        {renderRow("Weight",
                            <Input
                                id="weight"
                                value={"" + weight}
                                onChange={onChangeWeight}
                                style={inputStyle}
                            />, "The sorting order for the language model provider")}
                        {renderRow("Embedding Models",
                            <LmProviderUpdatePageExpandableInput
                                inputId="embedding-models"
                                models={models}
                                supportUserDefinedModels={provider.supportUserDefinedModels}
                                llmFeature='embedding'
                                onChange={onChangeModels}
                                onAddUserDefinedModel={onAddUserDefinedModel}
                                style={inputStyle}
                            />, "The chosen embedding models")}
                        {renderRow("Conversational Models",
                            <LmProviderUpdatePageExpandableInput
                                inputId="conversational-models"
                                models={models}
                                supportUserDefinedModels={provider.supportUserDefinedModels}
                                llmFeature='conversational'
                                onChange={onChangeModels}
                                onAddUserDefinedModel={onAddUserDefinedModel}
                                style={inputStyle}
                            />, "The chosen conversational models")}
                        {AifExperiments.ENABLE_VISION_MODELS && renderRow("Vision Models",
                            <LmProviderUpdatePageExpandableInput
                                inputId="vision-models"
                                models={models}
                                supportUserDefinedModels={provider.supportUserDefinedModels}
                                llmFeature='vision'
                                onChange={onChangeModels}
                                onAddUserDefinedModel={onAddUserDefinedModel}
                                style={inputStyle}
                            />, "The chosen vision models")}
                        {AifExperiments.ENABLE_TOOLS_MODELS && renderRow("Tools Models",
                            <LmProviderUpdatePageExpandableInput
                                inputId="tools-models"
                                models={models}
                                supportUserDefinedModels={provider.supportUserDefinedModels}
                                llmFeature='tools'
                                onChange={onChangeModels}
                                onAddUserDefinedModel={onAddUserDefinedModel}
                                style={inputStyle}
                            />, "The chosen models for function calling")}
                    </>}
                </TableBody>
            </Table>

            {!showOllamaSetup && <>
                <DefaultButton style={{ margin: 8 }} key="setup-button" onClick={onSubmit}>Setup</DefaultButton>
                <DefaultButton style={{ margin: 8 }} key="cancel-button" onClick={onCancel}>Cancel</DefaultButton>
            </>}
        </>);    
    }
};

export default LmProviderUpdatePage;
