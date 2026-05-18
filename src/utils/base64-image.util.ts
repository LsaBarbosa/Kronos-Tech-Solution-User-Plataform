export const extractBase64FromDataUrl = (dataUrl: string): string => {
  if (!dataUrl || !dataUrl.includes(',')) {
    return dataUrl;
  }

  const parts = dataUrl.split(',');
  return parts[1] ?? dataUrl;
};

export const isValidBase64Image = (base64String: string): boolean => {
  if (!base64String || typeof base64String !== 'string') {
    return false;
  }

  return base64String.length > 100 && /^[A-Za-z0-9+/=]+$/.test(base64String);
};
