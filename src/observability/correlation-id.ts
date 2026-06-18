let currentCorrelationId = "";

const createFallbackCorrelationId = () =>
  `kronos-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const createCorrelationId = () => {
  const cryptoRandomUUID = globalThis.crypto?.randomUUID?.bind(globalThis.crypto);
  return cryptoRandomUUID ? cryptoRandomUUID() : createFallbackCorrelationId();
};

export const setCurrentCorrelationId = (value?: string | null) => {
  if (!value || !value.trim()) {
    return;
  }

  currentCorrelationId = value.trim();
};

export const getCurrentCorrelationId = () => currentCorrelationId;

export const getOrCreateCorrelationId = () => {
  if (!currentCorrelationId) {
    currentCorrelationId = createCorrelationId();
  }

  return currentCorrelationId;
};
