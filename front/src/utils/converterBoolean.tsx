export function maskToPngFile(mask: boolean[][]): Promise<File> {
  return new Promise((resolve) => {
    const height = mask.length;
    const width = mask[0].length;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.createImageData(width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const value = mask[y][x] ? 255 : 0;

        imageData.data[i] = value; // R
        imageData.data[i + 1] = value; // G
        imageData.data[i + 2] = value; // B
        imageData.data[i + 3] = 255; // A
      }
    }

    ctx.putImageData(imageData, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], "mask.png", {
        type: "image/png",
      });

      resolve(file);
    }, "image/png");
  });
}
