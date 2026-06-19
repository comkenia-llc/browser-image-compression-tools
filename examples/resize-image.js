/**
 * Resize an image in the browser using canvas.
 *
 * Live tool:
 * https://imagescompression.com/resize-image
 */

export async function resizeImage(file, options = {}) {
    const {
        maxWidth = 1200,
        maxHeight = 1200,
        outputType = "image/jpeg",
        quality = 0.85,
    } = options;

    if (!file || !file.type.startsWith("image/")) {
        throw new Error("Please provide a valid image file.");
    }

    const bitmap = await createImageBitmap(file);

    const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Canvas is not supported in this browser.");
    }

    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
            (outputBlob) => {
                if (!outputBlob) {
                    reject(new Error("Resize failed."));
                    return;
                }

                resolve(outputBlob);
            },
            outputType,
            quality
        );
    });

    return new File([blob], file.name, { type: outputType });
}