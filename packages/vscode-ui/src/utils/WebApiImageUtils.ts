/**
 * Image processing with web APIs
 */

namespace WebApiImageUtils {
    export async function resizeDataUrl(dataUrl: string, options: { maxWidth?: number, maxHeight?: number }): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const img = new Image(); 
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                let width = img.width;
                let height = img.height;
                if (options.maxWidth && width > options.maxWidth) {
                    height = height * options.maxWidth / width;
                    width = options.maxWidth;
                }

                if (options.maxHeight && height > options.maxHeight) {
                    width = width * options.maxHeight / height;
                    height = options.maxHeight;
                }

                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                resolve(dataUrl);
            };
            img.onerror = function() {
                reject(new Error('Failed to load image'));
            }

            img.src = dataUrl;
        });
    }

    export async function readImageFileToDataUrl(file: File, options?: { maxWidth?: number, maxHeight?: number }): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (!options || (!options.maxWidth && !options.maxHeight)) {
                    resolve(e.target?.result as string);
                    return;
                } else {
                    const dataUrl = resizeDataUrl(e.target?.result as string, options);
                    resolve(dataUrl);
                }
            };
            reader.readAsDataURL(file);
        });
    }
}

export default WebApiImageUtils;
