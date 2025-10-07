import React, { useEffect, useRef, useState } from 'react';
import {
  IconButton,
  Backdrop,
  Stack,
  Box,
  Slide,
  Dialog,
  OutlinedInput,
  MenuItem,
  Select,
} from '@mui/material';
import Icon from '@mdi/react';
import {
  mdiCheck,
  mdiClose,
  mdiCog,
  mdiDownload,
  mdiMinus,
  mdiPencil,
  mdiPlus,
  mdiWeatherNight,
} from '@mdi/js';
import { Character, CharacterClassName, charClassDict } from '../../db/Types';
import { SpellSlotControl } from '../character-spell-lists/spellSlotControl';
import ButtonRow from '../../shared/buttonRow';
import './characterSettings.css';
import { downloadCharacter } from '../../importer/CharacterIO';
import ImageUploader from '../../shared/imageUploader';
import { useCharacter } from '../../context/character.context';

export function getMaxLevel(character: Character | undefined) {
  if (!character) {
    return 0;
  } else {
    return Math.max(
      0,
      ...character.spellSlots
        .filter((slotLevel) => slotLevel.available > 0)
        .map((slotLevel) => slotLevel.level)
    );
  }
}

const CharacterSettings: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);

  const { character, setCharacter } = useCharacter();

  const [maxLevel, setMaxLevel] = useState<number>(getMaxLevel(character));
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [textFieldString, setTextFieldString] = useState<string>('');
  const [characterClasses, setCharacterClasses] = useState<
    CharacterClassName[]
  >([]);
  const editRef = useRef<HTMLInputElement>(null);
  const classes = Object.values(charClassDict);

  useEffect(() => {
    if (character) {
      setMaxLevel(getMaxLevel(character));
      setTextFieldString(character.name);
      setCharacterClasses(character.classes.map((charClass) => charClass.name));
    }
    // eslint-disable-next-line
  }, [open, character]);

  const longRest = async (): Promise<void> => {
    if (character) {
      const newCharacter: Character = {
        ...character,
        spellSlots: character.spellSlots.map((spellSlotLevel) => {
          return { ...spellSlotLevel, used: 0 };
        }),
      };
      await setCharacter(newCharacter);
    }
  };

  const lessLevels = async () => {
    if (character) {
      const newChar: Character = {
        ...character,
        spellSlots: character.spellSlots.map((slotLevel) => {
          if (slotLevel.level < maxLevel) {
            return slotLevel;
          } else {
            return { level: slotLevel.level, used: 0, available: 0 };
          }
        }),
      };
      await setCharacter(newChar);
      if (maxLevel > 0) {
        setMaxLevel(maxLevel - 1);
      }
    }
  };

  const addLevel = async () => {
    if (maxLevel < 9) {
      setMaxLevel(maxLevel + 1);
    }
  };

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const stopPropagation = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const openNameEdit = () => {
    setEditDialogOpen(true);
    setTimeout(() => {
      console.log(editRef.current);
      if (editRef.current) {
        const inputElement: HTMLInputElement | null =
          editRef.current.querySelector('input');
        if (inputElement) {
          inputElement.focus();
        }
      }
    }, 200);
  };

  const handleTextFieldKeydown = async (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      await confirmEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const confirmEdit = async () => {
    await setCharacter({
      ...(character as unknown as Character),
      name: textFieldString,
      classes: characterClasses.map((charClass) => {
        return { name: charClass, level: 1 };
      }),
    });
    setEditDialogOpen(false);
  };

  const cancelEdit = () => {
    const char = character as unknown as Character;
    setTextFieldString(char.name);
    setCharacterClasses(char.classes.map((charClass) => charClass.name));
    setEditDialogOpen(false);
  };

  const resetCharacterImage = async () => {
    if (character) {
      await setCharacter({ ...character, image: undefined });
    }
  };

  return (
    <>
      <IconButton onClick={handleToggle} color="inherit">
        <Icon path={mdiCog} size={1} />
      </IconButton>

      <Backdrop
        open={open}
        onClick={handleClose}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        className={'backdrop'}
      >
        <Slide direction="up" in={open} mountOnEnter unmountOnExit>
          <Box
            onClick={stopPropagation}
            className={'backdrop-box-outer'}
            sx={{ bgcolor: 'background.default', color: 'text.primary' }}
          >
            <Box
              onClick={stopPropagation}
              className={'backdrop-box-inner'}
              sx={{ bgcolor: 'background.default' }}
            >
              <h5>Spell Slot Management</h5>
              {character && (
                <div>
                  <Stack spacing={1}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9]
                      .filter((level) => level <= maxLevel)
                      .map((_, index) => {
                        return character ? (
                          <SpellSlotControl
                            key={index}
                            slotLevel={index + 1}
                            character={character}
                          />
                        ) : (
                          <></>
                        );
                      })}
                    <div className="controls">
                      <ButtonRow
                        icon={<Icon path={mdiMinus} size={1}></Icon>}
                        label={'Remove Level'}
                        onClick={() => lessLevels()}
                      />
                      <ButtonRow
                        icon={<Icon path={mdiPlus} size={1}></Icon>}
                        label={'Add level'}
                        onClick={() => addLevel()}
                      />
                      <ButtonRow
                        icon={<Icon path={mdiWeatherNight} size={1}></Icon>}
                        label={'Long rest'}
                        onClick={() => longRest()}
                      />
                    </div>
                  </Stack>
                  <h5>General</h5>
                  <Stack spacing={1}>
                    <div>
                      <ButtonRow
                        icon={<Icon path={mdiDownload} size={1}></Icon>}
                        label={'Export Character'}
                        onClick={() => downloadCharacter(character!.uuid)}
                      />
                      <ButtonRow
                        icon={<Icon path={mdiPencil} size={1}></Icon>}
                        label={'Edit Character'}
                        onClick={() => {
                          setEditDialogOpen(true);
                        }}
                      />
                      <div style={{ display: 'flex' }}>
                        {character ? (
                          <ImageUploader character={character}></ImageUploader>
                        ) : (
                          ''
                        )}
                        <ButtonRow
                          icon={<Icon path={mdiClose} size={1} />}
                          label={'Reset Image'}
                          onClick={() => resetCharacterImage()}
                        ></ButtonRow>
                      </div>
                    </div>
                  </Stack>
                </div>
              )}
            </Box>
          </Box>
        </Slide>
      </Backdrop>
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          openNameEdit();
        }}
      >
        <div style={{ margin: '8px' }}>
          <h5 style={{ marginTop: 0, marginBottom: '8px' }}>
            New Character Name
          </h5>
          <OutlinedInput
            ref={editRef}
            value={textFieldString}
            onChange={(e) => setTextFieldString(e.target.value)}
            onKeyDown={(e) =>
              handleTextFieldKeydown(e as unknown as KeyboardEvent)
            }
          ></OutlinedInput>
          <h5 style={{ marginTop: '8px', marginBottom: '8px' }}>
            Edit Character Class
          </h5>
          <Select
            style={{ width: '100%' }}
            labelId="character-class-label"
            value={characterClasses}
            onChange={(e) =>
              setCharacterClasses(e.target.value as CharacterClassName[])
            }
            variant="outlined"
            multiple
          >
            {classes.map((charClass) => (
              <MenuItem key={charClass} value={charClass}>
                {' '}
                {charClass}
              </MenuItem>
            ))}
          </Select>
          <div style={{ display: 'flex', marginTop: '8px' }}>
            <ButtonRow
              justifyContent="center"
              label=""
              icon={<Icon path={mdiClose} size={1}></Icon>}
              onClick={() => cancelEdit()}
            />
            <ButtonRow
              justifyContent="center"
              label=""
              icon={<Icon path={mdiCheck} size={1}></Icon>}
              onClick={() => confirmEdit()}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default CharacterSettings;
