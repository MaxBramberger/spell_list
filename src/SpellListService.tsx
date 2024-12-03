import {BehaviorSubject} from "rxjs";

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

const spellList$: BehaviorSubject<Spell[]> = new BehaviorSubject<Spell[]>([]);

export const importSpells = (spells: Spell[]) => {
    spellList$.next(spells);
};

export const getSpellList$ = () => {
    return spellList$.asObservable();
};