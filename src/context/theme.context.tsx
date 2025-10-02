import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import {
  ColorTheme,
  getColorTheme,
  getPrimaryTheme,
  PRIMARY_THEME_DICT,
  PrimaryTheme,
  setColorTheme,
  setPrimaryTheme,
} from '../db/globalSettings';

interface ThemeContextType {
  mode: ColorTheme;
  toggleMode: () => void;
  appColor: PrimaryTheme;
  setPrimaryColor: (x: PrimaryTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error('useThemeMode must be used inside ThemeModeProvider');
  return ctx;
};

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<ColorTheme>('light');
  const [appColor, setAppColor] = useState<PrimaryTheme>('blue');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const savedColorTheme = await getColorTheme();
      setMode(savedColorTheme as ColorTheme);

      const savedPrimaryTheme = await getPrimaryTheme();
      setAppColor(savedPrimaryTheme as PrimaryTheme);
      setLoading(false);
    })();
  }, []);

  const toggleMode = async () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    await setColorTheme(next);
  };

  const setPrimaryColor = async (color: PrimaryTheme) => {
    setAppColor(color);
    await setPrimaryTheme(color);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode,
          primary: PRIMARY_THEME_DICT[appColor],
        },
      }),
    [mode, appColor]
  );

  if (loading) return null; // or splash screen

  return (
    <ThemeContext.Provider
      value={{ mode, toggleMode, appColor, setPrimaryColor }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
