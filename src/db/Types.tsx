export type SpellComponent = 'V' | 'S' | 'M';

export type CharacterClass = 'Bard' | 'Cleric' | 'Druid' | 'Paladin' | 'Ranger' | 'Sorcerer' | 'Warlock' | 'Wizard';

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