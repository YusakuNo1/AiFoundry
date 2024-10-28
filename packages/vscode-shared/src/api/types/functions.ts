export enum AifFunctionType {
	LOCAL = 'local',
	AZURE_FUNCTION = 'azure_functions',
}

export type FunctionEntity = {
	id: string,
	uri: string,
	name: string | undefined,
	functions_path: string,
	functions_name: string,
}

export type ListFunctionsResponse = {
	functions: FunctionEntity[];
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

export type CreateOrUpdateFunctionResponse = FunctionEntity;

export type DeleteFunctionResponse = {
	id: string,
};
