import { Character, CharacterClassName, SpellListType } from '../db/Types';

export class CharacterSpellListMapper {
  private lists: SpellListType[] = [];
  constructor(private character: Character) {
    this.initLists();
  }

  readonly spellPreparingClasses: CharacterClassName[] = [
    'Druid',
    'Cleric',
    'Paladin',
    'Wizard',
  ];

  readonly spellKnownClasses: CharacterClassName[] = [
    'Wizard',
    'Warlock',
    'Bard',
    'Ranger',
    'Sorcerer',
  ];

  private initLists(): void {
    const list: SpellListType[] = [];
    const characterHasKnownList = this.spellKnownClasses.some(
      (spellKnownClass) =>
        this.character.classes
          .map((characterClass) => characterClass.name)
          .includes(spellKnownClass)
    );
    if (characterHasKnownList) {
      list.push('Known');
    }
    const characterHasPreparedList = this.spellPreparingClasses.some(
      (spellPreparingClass) =>
        this.character.classes
          .map((characterClass) => characterClass.name)
          .includes(spellPreparingClass)
    );
    if (characterHasPreparedList) {
      list.push('Prepared');
    }
    this.lists = list;
  }

  getLists(): SpellListType[] {
    return this.lists;
  }
}
