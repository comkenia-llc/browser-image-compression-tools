/**
 * Compress a PNG image in the browser.
 *
 * Note:
 * Canvas PNG export is often lossless, so file reduction may be limited unless
 * you resize the image. For photos, JPG or WebP may create a smaller file.
 *
 * Live tool:
 * https://imagescompression.com/compress-png
 */

export async function compressPng(file, options = {}) {
    const { maxWidth = 1600, maxHeight = 1600 } = options;

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
        canvas.toBlob((outputBlob) => {
            if (!outputBlob) {
                reject(new Error("PNG compression failed."));
                return;
            }

            resolve(outputBlob);
        }, "image/png");
    });

    return new File(
        [blob],
        file.name.replace(/\.(jpg|jpeg|webp|avif|heic|png)$/i, ".png"),
        { type: "image/png" }
    );
}