/**
 * Compress an image toward a target KB size in the browser.
 *
 * Live tools:
 * https://imagescompression.com/compress-image-to-50kb
 * https://imagescompression.com/compress-image-to-100kb
 * https://imagescompression.com/compress-image-to-200kb
 */

export async function compressToTargetKb(file, options = {}) {
    const {
        targetKb = 100,
        maxWidth = 1600,
        maxHeight = 1600,
        minQuality = 0.35,
        initialQuality = 0.9,
        qualityStep = 0.07,
    } = options;

    if (!file || !file.type.startsWith("image/")) {
        throw new Error("Please provide a valid image file.");
    }

    const targetBytes = targetKb * 1024;
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

    let quality = initialQuality;
    let bestBlob = null;

    while (quality >= minQuality) {
        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(
                (outputBlob) => {
                    if (!outputBlob) {
                        reject(new Error("Compression failed."));
                        return;
                    }

                    resolve(outputBlob);
                },
                "image/jpeg",
                quality
            );
        });

        bestBlob = blob;

        if (blob.size <= targetBytes) {
            break;
        }

        quality -= qualityStep;
    }

    return new File(
        [bestBlob],
        file.name.replace(/\.(png|webp|avif|heic|jpeg|jpg)$/i, ".jpg"),
        { type: "image/jpeg" }
    );
}