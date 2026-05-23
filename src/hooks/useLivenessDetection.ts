import { useState, useCallback } from "react";

interface UseLivenessDetectionReturn {
  isDetecting: boolean;
  error: string | null;
  performLivenessCheck: (imageBase64: string) => Promise<boolean>;
}

export const useLivenessDetection = (): UseLivenessDetectionReturn => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performLivenessCheck = useCallback(async (imageBase64: string): Promise<boolean> => {
    setIsDetecting(true);
    setError(null);

    try {
      // Basic validation: check if image is valid and can be loaded
      const img = new Image();
      img.src = `data:image/jpeg;base64,${imageBase64}`;

      // Wait for image to load
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Timeout ao carregar imagem"));
        }, 5000);

        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };

        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("Falha ao carregar imagem. Verifique se o arquivo é uma imagem válida."));
        };
      });

      // Check image dimensions (should be reasonable for a face image)
      if (img.width < 200 || img.height < 200) {
        setError("Imagem muito pequena. Minimize o zoom e tente novamente.");
        return false;
      }

      // At this point, we have validated that:
      // 1. Image loads successfully
      // 2. Image has reasonable dimensions
      // The actual liveness detection (face detection, spoofing detection) will be done by the backend
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao validar imagem";
      setError(errorMessage);
      console.error("Image validation error:", err);
      return false;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  return {
    isDetecting,
    error,
    performLivenessCheck,
  };
};
