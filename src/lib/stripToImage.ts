const stripToImage = async (photos: File[], bgColor: string): Promise<string> => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const width = 300;
  const padding = 20;
  const photoHeight = 260;

  canvas.width = width;
  canvas.height = photos.length * (photoHeight + padding) + padding;

  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < photos.length; i++) {
    const file = photos[i];
    const img = await loadImage(file);
    ctx.drawImage(img, 20, padding + i * (photoHeight + padding), 260, photoHeight);
  }

  return canvas.toDataURL("image/jpeg", 0.95);
};

const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default stripToImage;
