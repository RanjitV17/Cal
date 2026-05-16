import { Capacitor } from "@capacitor/core";

// Lazy-init native plugins. No-ops in the browser.
export async function initNative() {
  if (!Capacitor.isNativePlatform()) return;
  const { StatusBar, Style } = await import("@capacitor/status-bar");
  const { SplashScreen } = await import("@capacitor/splash-screen");
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#09090b" });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {
    /* ignore */
  }
  try {
    await SplashScreen.hide();
  } catch {
    /* ignore */
  }
}

export const isNative = () => Capacitor.isNativePlatform();
export const nativePlatform = () => Capacitor.getPlatform();
