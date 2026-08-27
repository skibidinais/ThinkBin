/**
 * Client Device Fingerprint Generator (Layer 1 Anti-Duplicate Protection)
 */
export function getDeviceFingerprint(): string {
  if (typeof window === "undefined") {
    return "server-env";
  }

  // Check localStorage cache first
  const cachedFp = localStorage.getItem("tb_device_fingerprint");
  if (cachedFp) {
    return cachedFp;
  }

  // Build canvas & navigator fingerprint
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let canvasHash = "no-canvas";

    if (ctx) {
      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("ThinkBinFP,CanvasText", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("ThinkBinFP,CanvasText", 4, 17);
      canvasHash = canvas.toDataURL().slice(-50);
    }

    const nav = window.navigator;
    const rawFp = [
      nav.userAgent,
      nav.language,
      screen.colorDepth,
      screen.width + "x" + screen.height,
      new Date().getTimezoneOffset(),
      canvasHash,
      Math.random().toString(36).substring(2, 9),
    ].join("###");

    // Simple hash to hex string
    let hash = 0;
    for (let i = 0; i < rawFp.length; i++) {
      const char = rawFp.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }

    const generatedFp = "fp_" + Math.abs(hash).toString(16) + "_" + Date.now().toString(36);
    localStorage.setItem("tb_device_fingerprint", generatedFp);
    return generatedFp;
  } catch {
    const fallbackFp = "fp_fallback_" + Date.now().toString(36);
    localStorage.setItem("tb_device_fingerprint", fallbackFp);
    return fallbackFp;
  }
}
