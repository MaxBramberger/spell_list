import React from 'react';
import { Character, classIcons } from '../db/Types';
import Icon from '@mdi/react';

interface CharacterIconParam {
  character: Character;
}

export const CharacterIcon: React.FC<CharacterIconParam> = ({ character }) => {
  return character.image ? (
    <img
      src={character.image}
      alt="character"
      style={{ width: '34px', height: '34px', borderRadius: '17px' }}
    />
  ) : (
    <Icon
      key={character.classes[0].name}
      className="class-icon"
      path={classIcons[character.classes[0].name]}
    />
  );
};
