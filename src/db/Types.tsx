import {
  mdiAutoFix,
  mdiFire,
  mdiLinkVariant,
  mdiMusic,
  mdiPaw,
  mdiPineTree,
  mdiShieldHalfFull,
  mdiStarOutline,
  mdiWrench,
} from '@mdi/js';

export type SpellComponent = 'V' | 'S' | 'M';

export type CharacterClassName =
  | 'Artificer'
  | 'Bard'
  | 'Cleric'
  | 'Druid'
  | 'Paladin'
  | 'Ranger'
  | 'Sorcerer'
  | 'Warlock'
  | 'Wizard';

export interface CharacterClass {
  name: CharacterClassName;
  level: number;
}

export const charClassDict: { [K in CharacterClassName]: K } = {
  Artificer: 'Artificer',
  Bard: 'Bard',
  Cleric: 'Cleric',
  Druid: 'Druid',
  Paladin: 'Paladin',
  Ranger: 'Ranger',
  Sorcerer: 'Sorcerer',
  Warlock: 'Warlock',
  Wizard: 'Wizard',
};

export const classIcons: { [K in CharacterClassName]: string } = {
  Artificer: mdiWrench,
  Bard: mdiMusic,
  Cleric: mdiStarOutline,
  Druid: mdiPaw,
  Paladin: mdiShieldHalfFull,
  Ranger: mdiPineTree,
  Sorcerer: mdiFire,
  Warlock: mdiLinkVariant,
  Wizard: mdiAutoFix,
};

export interface Spell {
  index: string;
  name: string;
  desc: string[];
  higher_level?: string[];
  range: string;
  components: SpellComponent[];
  material?: string;
  concentration: boolean;
  ritual: boolean;
  duration: string;
  casting_time: string;
  level: number;
  school: string;
  classes: CharacterClassName[];
  subclasses: string[];
}

export const spellKeyDict: { [K in keyof Spell]: K } = {
  index: 'index',
  name: 'name',
  desc: 'desc',
  range: 'range',
  components: 'components',
  concentration: 'concentration',
  ritual: 'ritual',
  duration: 'duration',
  casting_time: 'casting_time',
  level: 'level',
  school: 'school',
  classes: 'classes',
  subclasses: 'subclasses',
};

export type SpellListType = 'Known' | 'Prepared' | 'Class' | 'All';

export interface SpellSlotLevel {
  level: number;
  available: number;
  used: number;
}

export interface Character {
  uuid: string;
  name: string;
  classes: CharacterClass[];
  knownSpellIndices: string[];
  preparedSpellIndices: string[];
  spellSlots: SpellSlotLevel[];
}

export const initialSpellSlots: SpellSlotLevel[] = [
  { level: 1, used: 0, available: 0 },
  { level: 2, used: 0, available: 0 },
  { level: 3, used: 0, available: 0 },
  { level: 4, used: 0, available: 0 },
  { level: 5, used: 0, available: 0 },
  { level: 6, used: 0, available: 0 },
  { level: 7, used: 0, available: 0 },
  { level: 8, used: 0, available: 0 },
  { level: 9, used: 0, available: 0 },
];
