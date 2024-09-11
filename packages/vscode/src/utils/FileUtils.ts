namespace FileUtils {
	export function convertTextToFunctionName(text: string): string {
		return text.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
	}
}

export default FileUtils;
