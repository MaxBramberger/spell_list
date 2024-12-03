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

class SpellDatabase extends Dexie {
    spells!: Table<Spell, string>; // Table name and primary key type

    constructor() {
        super('SpellDatabase');
        this.version(1).stores({
            spells: 'index, name', // Primary key and indexes
        });
    }
}

export const db = new SpellDatabase();