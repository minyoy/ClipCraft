import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import TweaksPanel from './components/TweaksPanel';
import AppRouter from './router/AppRouter';
import type { ThemeTweaks } from './types/app';

const TWEAK_DEFAULTS: ThemeTweaks = {
  accent: '#5B4CF5',
  darkSidebar: false,
  density: 'compact',
};

const ThemeContext = createContext<ThemeTweaks>({
  accent: '#5B4CF5',
  darkSidebar: false,
  density: 'compact',
});

export const useTheme = () => useContext(ThemeContext);

export default function App() {
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const [showTweaks, setShowTweaks] = useState(false);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === '__activate_edit_mode') setShowTweaks(true);
      if (event.data?.type === '__deactivate_edit_mode') setShowTweaks(false);
    };

    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const themeValue = useMemo(() => tweaks, [tweaks]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <AppRouter />

      {showTweaks && (
        <TweaksPanel
          tweaks={tweaks}
          setTweaks={setTweaks}
          onClose={() => setShowTweaks(false)}
        />
      )}
    </ThemeContext.Provider>
  );
}
