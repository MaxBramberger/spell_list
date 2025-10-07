import React, { useState } from 'react';
import { Character, classIcons } from '../db/Types';
import Icon from '@mdi/react';
import { Backdrop } from '@mui/material';
import './characterIcon.css';

interface CharacterIconParam {
  character: Character;
}

export const CharacterIcon: React.FC<CharacterIconParam> = ({ character }) => {
  const [open, setOpen] = useState<boolean>(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };
  return character.image ? (
    <>
      <img
        src={character.image}
        alt="character"
        style={{ width: '34px', height: '34px', borderRadius: '17px' }}
        onClick={handleOpen}
      />
      <Backdrop
        open={open}
        onClick={handleClose}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        className={'backdrop'}
      >
        <img
          src={character.image}
          alt="character"
          className="character-image"
          onClick={(event) => {
            event.stopPropagation();
          }}
        />
      </Backdrop>
    </>
  ) : (
    <Icon
      key={character.classes[0].name}
      className="class-icon"
      path={classIcons[character.classes[0].name]}
    />
  );
};
