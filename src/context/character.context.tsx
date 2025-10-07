// CharacterContext.tsx
import { liveQuery } from 'dexie';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../db/Db';
import { useObservable } from 'dexie-react-hooks';
import { upsertCharacter } from '../service/CharacterService';
import { Character } from '../db/Types';

interface CharacterContextType {
  character: Character | undefined;
  setCharacter: (updated: Character) => Promise<void>;
  refreshCharacter: () => Promise<void>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(
  undefined
);

export const CharacterProvider: React.FC<{
  id: string;
  children: React.ReactNode;
}> = ({ id, children }) => {
  const [character, setCharacterState] = useState<Character | undefined>();

  // Live reactive query using Dexie
  const liveCharacter = useObservable(liveQuery(() => db.characters.get(id)));

  useEffect(() => {
    setCharacterState(liveCharacter);
  }, [liveCharacter]);

  const setCharacter = async (updated: Character) => {
    await upsertCharacter(updated);
    // Dexie liveQuery automatically updates state
  };

  const refreshCharacter = async () => {
    const c = await db.characters.get(id);
    setCharacterState(c);
  };

  return (
    <CharacterContext.Provider
      value={{ character, setCharacter, refreshCharacter }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => {
  const ctx = useContext(CharacterContext);
  if (!ctx)
    throw new Error('useCharacter must be used within a CharacterProvider');
  return ctx;
};
