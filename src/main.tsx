import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { Keyboard } from '@capacitor/keyboard'
import App from './App.tsx'
import './index.css'

// setAccessoryBarVisible is iOS-only (per @capacitor/keyboard's docs) and has no
// web implementation registered, so calling it in the browser throws "Keyboard
// plugin is not implemented on web" — guard to iOS to avoid that.
if (Capacitor.getPlatform() === 'ios') {
  Keyboard.setAccessoryBarVisible({ isVisible: false });
}

createRoot(document.getElementById("root")!).render(<App />);
