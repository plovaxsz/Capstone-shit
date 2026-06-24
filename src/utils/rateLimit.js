const lastActionTimes = new Map();

export const checkRateLimit = (key, cooldownMs) => {
  const now = Date.now();
  const lastTime = lastActionTimes.get(key) || 0;
  const elapsed = now - lastTime;

  if (elapsed < cooldownMs) {
    return {
      allowed: false,
      retryAfterMs: cooldownMs - elapsed,
    };
  }

  lastActionTimes.set(key, now);
  return {
    allowed: true,
    retryAfterMs: 0,
  };
};

export const formatRateLimitMessage = (retryAfterMs) => {
  const seconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return `Please wait ${seconds} seconds before trying again.`;
};
