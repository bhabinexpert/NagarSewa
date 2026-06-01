/**
 * Resize an image File to a thumbnail and return a compressed JPEG data URL.
 *
 * Profile photos are stored as base64 in the database, so we downscale them
 * client-side (default max 256px, JPEG quality 0.8) to keep them small —
 * typically ~20-40 KB instead of several MB.
 *
 * @param {File} file - The selected image file
 * @param {number} [maxSize=256] - Max width/height in pixels
 * @param {number} [quality=0.8] - JPEG quality (0-1)
 * @returns {Promise<string>} A `data:image/jpeg;base64,...` URL
 */
export function resizeImageToDataUrl(file, maxSize = 256, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      reject(new Error("Please select a valid image file."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Scale down the longer side to maxSize, preserving aspect ratio.
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height >= width && height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load the selected image."));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read the selected file."));
    reader.readAsDataURL(file);
  });
}
