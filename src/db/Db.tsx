import Dexie, { Table } from 'dexie';

export type SpellComponent = 'V' | 'S' | 'M';

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
    classes: string[];
    subclasses: string[]
}

export interface SpellList {
    listType: string;
    spells: Spell[];
}

export interface Character {
    id?: number;
    name: string;
    class: string;
    lists: SpellList[]
}

class SpellDatabase extends Dexie {
    spells!: Table<Spell, string>; // Table name and primary key type
    characters!: Table<Character, number>;

    constructor() {
        super('SpellDatabase');
        this.version(1).stores({
            spells: 'index, name', // Primary key and indexes
        });
        this.version(2).stores({
            characters: '++id, name'
        })
    }
}

export const db = new SpellDatabase();