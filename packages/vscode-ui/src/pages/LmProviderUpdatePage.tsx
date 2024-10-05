import React from 'react';
import { useSelector } from 'react-redux';
import { Input, Label, Table, TableCell, TableHeader, TableRow, TableHeaderCell, TableBody } from '@fluentui/react-components';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { AifUtils, consts, types } from 'aifoundry-vscode-shared';
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

    const [provider, setProvider] = React.useState<types.api.LmProviderInfoResponse | null>(null);
    const [properties, setProperties] = React.useState<Record<string, types.api.LmProviderProperty>>({});
    const [weight, setWeight] = React.useState<string>("");
    const [models, setModels] = React.useState<types.api.LmProviderBaseModelInfo[]>([]);

    React.useEffect(() => {
        if (!lmProviders) {
            const message: types.MessageApiListLmProviders = {
                aifMessageType: "api",
                type: "api:listLmProviders",
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
            if (lmProvider.id === props.lmProviderId) {
                setProvider(lmProvider);
                setProperties({ ...lmProvider.properties });
                setWeight("" + lmProvider.weight);
                setModels(Object.values(lmProvider.modelMap));
            }
        }
    }, [lmProviders, props.lmProviderId]);


    const onSubmit = React.useCallback(() => {
        const _properties: Record<string, string> = {};
        for (const id of Object.keys(properties)) {
            if (properties[id].valueUri) {
                _properties[id] = properties[id].valueUri!;
            }
        }
        const _weight = parseInt(weight) ?? null;

        const message = createMessageApiUpdateLmProviderInfo(
            "api:updateLmProviderInfo",
            props.lmProviderId,
            _weight,
        );
        props.onPostMessage(message);
    }, [props, properties, weight]);

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

    const onChangeModel = React.useCallback((modelUri: string, selected: boolean) => {
        if (consts.EXP_LM_PROVIDER_MODEL_SELECTION_INSTANT_UPDATE) {
            const message = createMessageApiUpdateLmProviderModel(
                "api:updateLmProviderModel",
                props.lmProviderId,
                modelUri,
                selected,
            );
            props.onPostMessage(message);    
        }

        const newModels = models.map(model => {
            if (model.uri === modelUri) {
                return {
                    ...model,
                    selected,
                };
            } else {
                return model;
            }
        });

        setModels(newModels);
    }, [props, setModels, models]);

    const onAddUserDefinedModel = React.useCallback((modelName: string, llmFeature: types.api.LlmFeature) => {
        const existingModel = models.find(model => model.name === modelName);
        if (existingModel) {
            if (!existingModel.features.includes(llmFeature)) {
                const newModel = {
                    ...existingModel,
                    types: [...existingModel.features, llmFeature],
                };
                setModels([...models.filter(model => model.name !== modelName), newModel]);
            }
            return;
        } else {
            const newModel: types.api.LmProviderBaseModelInfo = {
                uri: AifUtils.createAifUri(props.lmProviderId, AifUtils.AifUriCategory.Models, modelName),
                name: modelName,
                providerId: props.lmProviderId,
                features: [llmFeature],
                selected: true,
                isUserDefined: true,
                tags: [llmFeature],
            };
            setModels([...models, newModel]);    
        }
    }, [models, setModels, props.lmProviderId]);

    function renderRow(name: string, valueElement: React.ReactElement | string | number | undefined, descriptionElement: React.ReactElement | string) {
        return (<TableRow key={name}>
            <TableCell>{name}</TableCell>
            <TableCell>{valueElement}</TableCell>
            <TableCell>{descriptionElement}</TableCell>
        </TableRow>);
    }

    const inputStyle = { width: "100%" };
    const showOllamaSetup = provider?.id === consts.LOCAL_LM_PROVIDER_ID_OLLAMA && systemMenuItem?.status === "unavailable";
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
                            if (property.valueUri === consts.LM_PROVIDER_PROP_VALUE_MASK) {
                                const placeholder = property.hint;
                                return renderRow(id, <Input id={id} type="password" placeholder={placeholder} onChange={onChangeProperty} style={inputStyle} />, property.description);
                            } else {
                                const value = property.valueUri ?? undefined;
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
                                onChange={onChangeModel}
                                onAddUserDefinedModel={onAddUserDefinedModel}
                                style={inputStyle}
                            />, "The chosen embedding models")}
                        {renderRow("Conversational Models",
                            <LmProviderUpdatePageExpandableInput
                                inputId="conversational-models"
                                models={models}
                                supportUserDefinedModels={provider.supportUserDefinedModels}
                                llmFeature='conversational'
                                onChange={onChangeModel}
                                onAddUserDefinedModel={onAddUserDefinedModel}
                                style={inputStyle}
                            />, "The chosen conversational models")}
                        {AifExperiments.ENABLE_VISION_MODELS && renderRow("Vision Models",
                            <LmProviderUpdatePageExpandableInput
                                inputId="vision-models"
                                models={models}
                                supportUserDefinedModels={provider.supportUserDefinedModels}
                                llmFeature='vision'
                                onChange={onChangeModel}
                                onAddUserDefinedModel={onAddUserDefinedModel}
                                style={inputStyle}
                            />, "The chosen vision models")}
                        {AifExperiments.ENABLE_TOOLS_MODELS && renderRow("Tools Models",
                            <LmProviderUpdatePageExpandableInput
                                inputId="tools-models"
                                models={models}
                                supportUserDefinedModels={provider.supportUserDefinedModels}
                                llmFeature='tools'
                                onChange={onChangeModel}
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

function createMessageApiUpdateLmProviderInfo(
    messageApiType: "api:updateLmProviderInfo",
    lmProviderId: string,
    weight: number | null,
): types.MessageApiUpdateLmProviderInfo {
    const request: types.api.UpdateLmProviderInfoRequest = {
        id: lmProviderId,
        weight: weight ?? undefined,
    };

    const message: types.MessageApiUpdateLmProviderInfo = {
        aifMessageType: "api",
        type: messageApiType,
        data: request,
    };
    return message;
}

function createMessageApiUpdateLmProviderModel(
    messageApiType: "api:updateLmProviderModel",
    lmProviderId: string,
    modelUri: string,
    selected: boolean,
): types.MessageApiUpdateLmProviderModel {
    const request: types.api.UpdateLmProviderModelRequest = {
        id: lmProviderId,
        modelUri,
        selected,
    };

    const message: types.MessageApiUpdateLmProviderModel = {
        aifMessageType: "api",
        type: messageApiType,
        data: request,
    };
    return message;
}

export default LmProviderUpdatePage;
