import React from 'react';
import { CharacterProvider } from '../context/character.context';
import { CharacterSpellLists } from './character-spell-lists/characterSpellLists';
import { useParams } from 'react-router-dom';

export const CharacterPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) return <div>No character ID provided.</div>;

  return (
    <CharacterProvider id={id}>
      <CharacterSpellLists />
    </CharacterProvider>
  );
};
