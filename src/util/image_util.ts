export function downscaleImage(
  file: File,
  maxWidth: number = 128,
  maxHeight: number = 128
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const result = event.target?.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to read file as data URL.'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = maxHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context.'));
          return;
        }

        ctx.drawImage(img, 0, 0, maxWidth, maxHeight);
        const base64 = canvas.toDataURL('image/png');
        resolve(base64);
      };

      img.onerror = () => reject(new Error('Failed to load image.'));
      img.src = result;
    };

    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}
