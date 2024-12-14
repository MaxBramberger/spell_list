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

export type CharacterClassName = 'Bard' | 'Cleric' | 'Druid' | 'Paladin' | 'Ranger' | 'Sorcerer' | 'Warlock' | 'Wizard';

export interface CharacterClass  {
    name: CharacterClassName,
    level: number
}

export const charClassDict: { [K in CharacterClassName]: K} = {
    Bard: "Bard",
    Cleric: "Cleric",
    Druid: "Druid",
    Paladin: "Paladin",
    Ranger: "Ranger",
    Sorcerer: "Sorcerer",
    Warlock: "Warlock",
    Wizard: "Wizard"
}

export const classIcons: { [K in CharacterClassName]: string} = {
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
    classes: CharacterClassName[];
    subclasses: string[]
}

export const spellKeyDict: {[K in keyof Spell]: K} = {
    index: "index",
    name: "name",
    desc: "desc",
    range: "range",
    components: "components",
    concentration: "concentration",
    ritual: "ritual",
    duration: "duration",
    casting_time: "casting_time",
    level: "level",
    school: "school",
    classes: "classes",
    subclasses: "subclasses"
}

export type SpellListType = 'Known' | 'Prepared' | 'Class' | 'All';

export interface Character {
    uuid: string;
    name: string;
    classes: CharacterClass[];
    knownSpellIndices: string[];
    preparedSpellIndices: string[];
}