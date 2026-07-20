/**
 * Validates if an image at a given URL meets the minimum dimension requirements.
 * @param url The URL of the image to validate.
 * @param minWidth The minimum required width in pixels.
 * @param minHeight The minimum required height in pixels.
 * @returns A promise that resolves to true if valid, or an error message if invalid.
 */
export async function validateImageDimensions(url: string, minWidth: number, minHeight: number): Promise<boolean | string> {
  if (!url) return true; // Optional image condition handled elsewhere

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth < minWidth || img.naturalHeight < minHeight) {
        resolve(`Resolution too low. Required: ${minWidth}x${minHeight}. Found: ${img.naturalWidth}x${img.naturalHeight}`);
      } else {
        resolve(true);
      }
    };
    img.onerror = () => {
      resolve("Invalid image URL or unreachable resource.");
    };
    img.src = url;
  });
}
