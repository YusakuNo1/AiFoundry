namespace CookiesUtils {
	export function getCookiesFromHeaders(cookies: string[], cookieKeys: string[]): Record<string, string> {
		const cookiesDict: Record<string, string> = {};
		for (const cookie of cookies) {
			for (const cookieKey of cookieKeys) {
				if (cookie.includes(cookieKey)) {
					const cookieValue = _getCookie(cookie, cookieKey);
					if (cookieValue) {
						cookiesDict[cookieKey] = cookieValue;
					}
				}
			}
		}
		return cookiesDict;
	}

	export function getCookieFromHeaders(cookies: string[], cookieKey: string): string | null {
		for (const cookie of cookies) {
			if (cookie.includes(cookieKey)) {
				return _getCookie(cookie, cookieKey);
			}
		}
		return null;
	}
}

function _getCookie(setCookie: string, cookieName: string): string {
	const cookieParts = setCookie.split(';');
	const cookie = cookieParts.find((cookiePart) => cookiePart.includes(cookieName));
	if (!cookie) {
		throw new Error(`Cookie ${cookieName} not found in ${setCookie}`);
	}
	const cookieValue = cookie.split('=')[1];
	return cookieValue;
}

export default CookiesUtils;
