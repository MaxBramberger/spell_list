import Dexie, { Table } from 'dexie';
import { Character, GlobalSetting, initialSpellSlots, Spell } from './Types';

class SpellDatabase extends Dexie {
  spells!: Table<Spell, string>; // Table name and primary key type
  characters!: Table<Character, string>;
  globalSettings!: Table<GlobalSetting, string>;

  constructor() {
    super('SpellDatabase');
    this.version(1).stores({
      spells: 'index, name', // Primary key and indexes
    });
    this.version(2).stores({
      characters: 'uuid, name',
    });
    this.version(3).upgrade(async (trans) => {
      await trans
        .table('characters')
        .toCollection()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .modify((character: any) => {
          character.spellSlots = initialSpellSlots;
        });
    });
    this.version(4).stores({
      globalSettings: 'key, value',
    });
  }
}

export const db = new SpellDatabase();
