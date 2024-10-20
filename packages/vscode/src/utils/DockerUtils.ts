import * as os from 'os';
import { exec } from 'child_process';
import { consts } from 'aifoundry-vscode-shared';


namespace DockerUtils {
	export type RunDockerCommandResponse = {
		success: boolean;
		output: string;
	};

	export async function checkDockerApp(): Promise<RunDockerCommandResponse> {
		return _runDockerCommand('info', (response) => _checkDockerInstallation(response.output));
	}

	export async function startDockerDevContainer(startServer: boolean): Promise<boolean> {
		const homedir = os.homedir();
		const localAssetsPath = `${homedir}/${consts.AIFOUNDRY_LOCAL_SERVER_FOLDER_NAME}/${consts.ASSETS_FOLDER_NAME}`;
		const containerAssetsPath = `${consts.CONTAINER_HOME_DIR}/${consts.ASSETS_FOLDER_NAME}`;
		const dockerGatewayMappingParameter = "--add-host=host.docker.internal:host-gateway";
		const startServerCommand = "/bin/sh -c \"./start_server.dev.sh\"";
		const commandStartContainer = `run -i -p 30303:30303 --name ${consts.DOCKER_CONTAINER_NAME} -v ${localAssetsPath}:${containerAssetsPath} ${dockerGatewayMappingParameter} ${consts.DOCKER_HUB_IMAGE_ID} ${startServer ? startServerCommand : ""}`;

		try {
			await _runDockerCommand(`rm ${consts.DOCKER_CONTAINER_NAME}`);
			// Don't wait for the response as the response will be sent when the container is stopped but not started
			_runDockerCommand(commandStartContainer);
			return true;
		} catch (error) {
			return false;
		}
	}

	// checkDockerServer should be a fire and forget because it'll hang the main thread for Docker server
	export async function checkDockerServer(infoCommandOutput: string): Promise<boolean> {
		// Check for every 1 seconds for 3 times
		const maxTries = 3;
		const tryInterval = 1000;
		for (let i = 0; i < maxTries; i++) {
			if (_checkDockerServer(infoCommandOutput)) {
				return true;
			}

			await new Promise((resolve) => setTimeout(resolve, tryInterval));

			const result = await checkDockerApp();
			if (!result.success) {
				return false;
			} else {
				infoCommandOutput = result.output;
			}
		}

		return false;
	}

	export async function startDockerApp(): Promise<boolean> {
		if (process.platform === 'darwin') {
			return new Promise<boolean>((resolve) => {
				exec("open -a Docker");

				setTimeout(() => {
					resolve(true);
				}, 5000);
			});
		} else if (process.platform === 'win32') {
			// TODO: not implemented
			return false;
		} else if (process.platform === 'linux') {
			// TODO: not implemented
			return false;
		} else {
			return false;
		}
	}
}

function _getDockerPaths(): string[] {
	if (process.platform === 'win32') {
		return ['docker'];
	} else if (process.platform === 'darwin' || process.platform === 'linux') {
		return ['/usr/local/bin/docker', '/usr/bin/docker'];
	} else {
		throw new Error('Unsupported platform');
	}
}

type RunDockerCommandSuccessChecker = (response: DockerUtils.RunDockerCommandResponse) => boolean;
async function _runDockerCommand(commandParams: string, isSuccessChecker?: RunDockerCommandSuccessChecker): Promise<DockerUtils.RunDockerCommandResponse> {
	for await (const path of _getDockerPaths()) {
		const promise = new Promise<DockerUtils.RunDockerCommandResponse>((resolve) => {
			exec(`${path} ${commandParams}`, (error, stdout, stderr) => {
				resolve({ success: !error, output: stdout });
			});
		});
		const result = await promise;

		if (isSuccessChecker) {
			result.success = isSuccessChecker(result);
		}

		if (result.success) {
			return result;
		}
	}
	return { success: false, output: '' };
}

export function _checkDockerInstallation(infoCommandOutput: string): boolean {
	// If the Docker app is not installed, the command output will contain something like "command not found", depending on the platform
	return infoCommandOutput.includes('Server:');
}

export function _checkDockerServer(infoCommandOutput: string): boolean {
	return infoCommandOutput.includes('Server Version:');
}

export default DockerUtils;
