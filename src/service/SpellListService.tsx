import {BehaviorSubject} from "rxjs";
import {db} from "../db/Db";
import {Spell} from "../db/Types";

const spellList$: BehaviorSubject<Spell[]> = new BehaviorSubject<Spell[]>([]);

export const importSpells = (spells: Spell[]) => {
    spells.forEach(spell => {
        db.spells.put(spell, spell.index)
    })
    fetchSpells().then()
};

export const fetchSpells = async () => {
    const spells = await db.spells.toArray()
    spellList$.next(spells);
}

export const getSpellList$ = () => {
    return spellList$.asObservable();
};