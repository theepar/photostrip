import { toJpeg } from "html-to-image";

const stripToImage = async (node: HTMLElement): Promise<string> => {
  if (!node) {
    throw new Error("Element HTML tidak ditemukan");
  }

  try {
    const dataUrl = await toJpeg(node, {
      quality: 0.95,
      pixelRatio: 3,
      backgroundColor: "transparent",
      style: {
        margin: "0",
      }
    });

    return dataUrl;
  } catch (error) {
    console.error("Gagal generate image:", error);
    throw error;
  }
};

export default stripToImage;