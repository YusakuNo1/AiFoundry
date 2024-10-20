export enum AifFunctionType {
	LOCAL = 'local',
	AZURE_FUNCTION = 'azure_functions',
}

export type FunctionMetadata = {
	id: string,
	uri: string,
	name: string | undefined,
	functions_path: string,
	functions_name: string,
}

export type ListFunctionsResponse = {
	functions: FunctionMetadata[];
};

export type CreateFunctionRequest = {
	type: AifFunctionType,
	name: string | undefined,
	functions_path: string,
	functions_name: string,
}

export type UpdateFunctionRequest = {
	id: string,
	name: string | undefined,
}

export type CreateOrUpdateFunctionResponse = FunctionMetadata;

export type DeleteFunctionResponse = {
	id: string,
};
