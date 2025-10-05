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
import {
  fetchCharacters,
  getCharacter$,
  upsertCharacter,
} from '../../service/CharacterService';
import { firstValueFrom } from 'rxjs';
import { SpellSlotControl } from '../character-spell-lists/spellSlotControl';
import ButtonRow from '../../shared/buttonRow';
import './characterSettings.css';
import { downloadCharacter } from '../../importer/CharacterIO';
import ImageUploader from '../../shared/imageUploader';

interface SpellSlotManagementParams {
  character?: Character;
}

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

const CharacterSettings: React.FC<SpellSlotManagementParams> = (
  param: SpellSlotManagementParams
) => {
  const [open, setOpen] = useState<boolean>(false);
  const [maxLevel, setMaxLevel] = useState<number>(
    getMaxLevel(param.character)
  );
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [textFieldString, setTextFieldString] = useState<string>('');
  const [characterClasses, setCharacterClasses] = useState<
    CharacterClassName[]
  >([]);
  const editRef = useRef<HTMLInputElement>(null);
  const classes = Object.values(charClassDict);

  useEffect(() => {
    if (param.character) {
      const subscription = getCharacter$(param.character.uuid).subscribe(
        (char) => {
          console.log(char, getMaxLevel(char));
          setMaxLevel(getMaxLevel(char));
          setTextFieldString(char?.name ?? '');
          setCharacterClasses(
            char ? char.classes.map((charClass) => charClass.name) : []
          );
        }
      );
      return () => subscription.unsubscribe();
    }
    // eslint-disable-next-line
  }, [open]);

  const longRest = async (): Promise<void> => {
    if (param.character) {
      const character = await firstValueFrom(
        getCharacter$(param.character.uuid)
      );
      if (character) {
        const newCharacter: Character = {
          ...character,
          spellSlots: character.spellSlots.map((spellSlotLevel) => {
            return { ...spellSlotLevel, used: 0 };
          }),
        };
        await upsertCharacter(newCharacter);
      }
    }
  };

  const lessLevels = async () => {
    if (param.character) {
      const char = await firstValueFrom(getCharacter$(param.character.uuid));
      if (char) {
        const newChar: Character = {
          ...char,
          spellSlots: char.spellSlots.map((slotLevel) => {
            if (slotLevel.level < maxLevel) {
              return slotLevel;
            } else {
              return { level: slotLevel.level, used: 0, available: 0 };
            }
          }),
        };
        await upsertCharacter(newChar);
        if (maxLevel > 0) {
          setMaxLevel(maxLevel - 1);
        }
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
    await upsertCharacter({
      ...(param.character as unknown as Character),
      name: textFieldString,
      classes: characterClasses.map((charClass) => {
        return { name: charClass, level: 1 };
      }),
    });
    await fetchCharacters();
    setEditDialogOpen(false);
  };

  const cancelEdit = () => {
    const char = param.character as unknown as Character;
    setTextFieldString(char.name);
    setCharacterClasses(
      char ? char.classes.map((charClass) => charClass.name) : []
    );
    setEditDialogOpen(false);
  };

  const resetCharacterImage = async () => {
    if (param.character) {
      await upsertCharacter({ ...param.character, image: undefined });
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
              {param.character && (
                <div>
                  <Stack spacing={1}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9]
                      .filter((level) => level <= maxLevel)
                      .map((_, index) => {
                        return (
                          <SpellSlotControl
                            key={index}
                            slotLevel={index + 1}
                            character={param.character!}
                          />
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
                        onClick={() => downloadCharacter(param.character!.uuid)}
                      />
                      <ButtonRow
                        icon={<Icon path={mdiPencil} size={1}></Icon>}
                        label={'Edit Character'}
                        onClick={() => {
                          setEditDialogOpen(true);
                        }}
                      />
                      <div style={{ display: 'flex' }}>
                        {param.character ? (
                          <ImageUploader
                            character={param.character}
                          ></ImageUploader>
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
