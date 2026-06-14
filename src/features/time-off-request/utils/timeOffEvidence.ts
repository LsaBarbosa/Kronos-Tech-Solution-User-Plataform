import { isAllowedDocumentFile, MAX_UPLOAD_SIZE_BYTES } from "@/types/document";
import { TIME_OFF_EVIDENCE_SIZE_ERROR, TIME_OFF_EVIDENCE_TYPE_ERROR } from "./timeOffValidation";

const blobToFile = (blob: Blob, fileName: string) =>
  new File([blob], fileName, {
    type: blob.type,
    lastModified: Date.now(),
  });

export const compressEvidenceImage = (file: File, quality = 0.72): Promise<File> =>
  new Promise((resolve) => {
    if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type.startsWith("image/svg")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;
        context?.drawImage(img, 0, 0, img.width, img.height);

        canvas.toBlob((blob) => {
          if (blob && blob.size < file.size) {
            resolve(blobToFile(blob, file.name));
            return;
          }

          resolve(file);
        }, "image/jpeg", quality);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });

export const prepareEvidenceFile = async (file: File): Promise<{ file?: File; error?: string }> => {
  if (!isAllowedDocumentFile(file)) {
    return { error: TIME_OFF_EVIDENCE_TYPE_ERROR };
  }

  const compressedFile = await compressEvidenceImage(file);
  if (compressedFile.size > MAX_UPLOAD_SIZE_BYTES) {
    return { error: TIME_OFF_EVIDENCE_SIZE_ERROR() };
  }

  return { file: compressedFile };
};
