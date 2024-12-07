import Dexie, {Table} from 'dexie';
import {Character, Spell} from "./Types";

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