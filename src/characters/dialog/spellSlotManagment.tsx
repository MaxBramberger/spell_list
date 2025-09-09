import React, { useEffect, useState } from 'react';
import { IconButton, Backdrop, Stack, Box, Slide } from '@mui/material';
import Icon from '@mdi/react';
import { mdiCog, mdiMinus, mdiPlus, mdiWeatherNight } from '@mdi/js';
import { Character } from '../../db/Types';
import { getCharacter$, upsertCharacter } from '../../service/CharacterService';
import { firstValueFrom } from 'rxjs';
import { SpellSlotControl } from '../character-spell-lists/spellSlotControl';
import ButtonRow from '../../shared/buttonRow';
import './spellSlotManagement.css';

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

const SpellSlotManagement: React.FC<SpellSlotManagementParams> = (
  param: SpellSlotManagementParams
) => {
  const [open, setOpen] = useState<boolean>(false);
  const [maxLevel, setMaxLevel] = useState<number>(
    getMaxLevel(param.character)
  );

  useEffect(() => {
    if (param.character) {
      const subscription = getCharacter$(param.character.uuid).subscribe(
        (char) => {
          console.log(char, getMaxLevel(char));
          setMaxLevel(getMaxLevel(char));
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
          <Box onClick={stopPropagation} className={'backdrop-box-outer'}>
            <Box onClick={stopPropagation} className={'backdrop-box-inner'}>
              {param.character && (
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
              )}
            </Box>
          </Box>
        </Slide>
      </Backdrop>
    </>
  );
};

export default SpellSlotManagement;
