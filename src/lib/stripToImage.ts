const stripToImage = async (
  photos: File[],
  bgColor: string,
  name?: string
): Promise<string> => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const frameWidth = 260;
  const frameHeight = Math.round((3 / 4) * frameWidth); // 195px
  const padding = 20;
  const nameHeight = name ? 60 : 0;

  canvas.width = frameWidth + padding * 2;
  canvas.height = photos.length * (frameHeight + padding) + padding + nameHeight;

  if (!ctx) throw new Error("Canvas not supported");

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw photos
  for (let i = 0; i < photos.length; i++) {
    const file = photos[i];
    const img = await loadImage(file);

    const x = padding;
    const y = padding + i * (frameHeight + padding);

    const { sx, sy, sWidth, sHeight } = getCropCover(img, frameWidth, frameHeight);
    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, frameWidth, frameHeight);
  }

  // Draw name if exists
  if (name) {
    ctx.fillStyle = "#000";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, canvas.width / 2, canvas.height - nameHeight / 2 - 20);    
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

const getCropCover = (
  img: HTMLImageElement,
  frameW: number,
  frameH: number
) => {
  const imgRatio = img.width / img.height;
  const frameRatio = frameW / frameH;

  let sx = 0,
    sy = 0,
    sWidth = img.width,
    sHeight = img.height;

  if (imgRatio > frameRatio) {
    // Image too wide
    sWidth = img.height * frameRatio;
    sx = (img.width - sWidth) / 2;
  } else {
    // Image too tall
    sHeight = img.width / frameRatio;
    sy = (img.height - sHeight) / 2;
  }

  return { sx, sy, sWidth, sHeight };
};

export default stripToImage;
