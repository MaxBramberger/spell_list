import {CharacterClass, CharacterSpellList} from "../db/Types";


export class CharacterSpellListMapper {
    constructor(private characterClass: CharacterClass) {}

    readonly spellPreparingClasses: CharacterClass[] = [
        "Druid",
        "Cleric",
        "Paladin",
        "Wizard",
    ]

    readonly spellKnownClasses: CharacterClass[] = [
        "Wizard",
        "Warlock",
        "Bard",
        "Ranger",
        "Sorcerer"
    ]

    getLists(): CharacterSpellList[] {
        const list : CharacterSpellList[] = [];
        if(this.spellKnownClasses.includes(this.characterClass)){
            list.push({listType: "Known", spellIndices: []})
        }

        if(this.spellPreparingClasses.includes(this.characterClass)){
            list.push({listType: "Prepared", spellIndices: []})
        }
        return list
    }
}