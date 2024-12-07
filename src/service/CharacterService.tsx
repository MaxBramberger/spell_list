import { BehaviorSubject} from "rxjs";
import {db} from "../db/Db";
import {Character} from "../db/Types";

const characters$: BehaviorSubject<Character[]> = new BehaviorSubject<Character[]>([]);


export const fetchCharacters = async () => {
    const characters = await db.characters.toArray()
    characters$.next(characters);
}

export const addCharacter =  async ( character: Omit<Character, 'id'>) => {
    db.characters.add(character);
    fetchCharacters().then()
}

export const getCharacters$ = () => {
    return characters$.asObservable();
};

export const deleteCharacter = async (id?: number) => {
    if(id!==undefined){
        db.characters.delete(id);
        await fetchCharacters()
    }
}

