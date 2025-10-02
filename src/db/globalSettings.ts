import { db } from './Db';
import {
  amber,
  blue,
  deepPurple,
  green,
  indigo,
  pink,
  purple,
  red,
  teal,
} from '@mui/material/colors';
import { PaletteColorOptions } from '@mui/material';

export const DefaultDictKeys = {
  colorTheme: 'colorTheme',
  primaryTheme: 'primaryTheme',
} as const;

export type DefaultDictKeys = keyof typeof DefaultDictKeys;

export type ColorTheme = 'light' | 'dark';
export const PrimaryTheme = {
  blue: 'blue',
  purple: 'purple',
  red: 'red',
  green: 'green',
  pink: 'pink',
  indigo: 'indigo',
  teal: 'teal',
  amber: 'amber',
  deepPurple: 'deepPurple',
} as const;

export type PrimaryTheme = keyof typeof PrimaryTheme;

const DEFAULT_SETTINGS: { [K in DefaultDictKeys]: ColorTheme | PrimaryTheme } =
  {
    colorTheme: 'light',
    primaryTheme: 'blue',
  };

export async function getGlobalSetting(key: DefaultDictKeys) {
  const setting = await db.globalSettings.get(key);
  return setting ? setting.value : DEFAULT_SETTINGS[key];
}

export async function getColorTheme(): Promise<ColorTheme> {
  return (await getGlobalSetting(DefaultDictKeys.colorTheme)) as ColorTheme;
}

export async function setColorTheme(theme: ColorTheme) {
  console.log(theme);
  await db.globalSettings.put(
    { key: DefaultDictKeys.colorTheme, value: theme },
    DefaultDictKeys.colorTheme
  );
}

export async function getPrimaryTheme(): Promise<PrimaryTheme> {
  return (await getGlobalSetting(DefaultDictKeys.primaryTheme)) as PrimaryTheme;
}

export async function setPrimaryTheme(theme: PrimaryTheme) {
  await db.globalSettings.put(
    { key: DefaultDictKeys.primaryTheme, value: theme },
    DefaultDictKeys.primaryTheme
  );
}

export const PRIMARY_THEME_DICT: { [K in PrimaryTheme]: PaletteColorOptions } =
  {
    blue: blue,
    pink: pink,
    purple: purple,
    red: red,
    green: green,
    indigo: indigo,
    teal: teal,
    amber: amber,
    deepPurple: deepPurple,
  };
