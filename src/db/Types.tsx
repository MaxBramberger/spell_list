import {
    mdiAutoFix,
    mdiFire,
    mdiLinkVariant,
    mdiMusic,
    mdiPaw,
    mdiPineTree,
    mdiShieldHalfFull,
    mdiStarOutline
} from "@mdi/js";

export type SpellComponent = 'V' | 'S' | 'M';

export type CharacterClass = 'Bard' | 'Cleric' | 'Druid' | 'Paladin' | 'Ranger' | 'Sorcerer' | 'Warlock' | 'Wizard';

export const charClassDict: { [K in CharacterClass]: K} = {
    Bard: "Bard",
    Cleric: "Cleric",
    Druid: "Druid",
    Paladin: "Paladin",
    Ranger: "Ranger",
    Sorcerer: "Sorcerer",
    Warlock: "Warlock",
    Wizard: "Wizard"
}

export const classIcons: { [K in CharacterClass]: string} = {
    Bard: mdiMusic,
    Cleric: mdiStarOutline,
    Druid: mdiPaw,
    Paladin: mdiShieldHalfFull,
    Ranger: mdiPineTree,
    Sorcerer: mdiFire,
    Warlock: mdiLinkVariant,
    Wizard: mdiAutoFix
}

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

export interface CharacterSpellList {
    listType: string;
    spellIndices: string[];
}

export interface Character {
    id?: number;
    name: string;
    class: CharacterClass;
    lists: CharacterSpellList[]
}