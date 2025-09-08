import { Character, SpellSlotLevel } from '../../db/Types';
import { Checkbox, IconButton, TableCell, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Icon from '@mdi/react';
import { mdiMinus, mdiPlus } from '@mdi/js';
import './spellSlotControl.css';
import { getCharacter$, upsertCharacter } from '../../service/CharacterService';

export interface SpellSlotControlInput {
  character: Character;
  slotLevel: number;
}

export const SpellSlotControl = (input: SpellSlotControlInput) => {
  const [character, setCharacter] = useState<Character | undefined>(undefined);

  useEffect(() => {
    const subscription = getCharacter$(input.character.uuid).subscribe(
      (charFromDb) => {
        setCharacter(charFromDb);
      }
    );
    return () => subscription.unsubscribe();
  }, [character]);

  const addSpellSlot = async (event: MouseEvent) => {
    event.stopPropagation();

    if (character) {
      const currentSpellSlots = getCurrentSpellSlots(character);
      if (currentSpellSlots && currentSpellSlots.available < 4) {
        const newSpellSlots: SpellSlotLevel = {
          level: currentSpellSlots.level,
          available: currentSpellSlots.available + 1,
          used: currentSpellSlots.used,
        };
        const newCharacter: Character = {
          ...character,
          spellSlots: character.spellSlots.map((value) => {
            if (value.level === newSpellSlots.level) {
              return newSpellSlots;
            } else {
              return value;
            }
          }),
        };
        await upsertCharacter(newCharacter);
        setCharacter(newCharacter);
      }
    }
  };

  const removeSpellSlot = async (event: MouseEvent) => {
    event.stopPropagation();

    const currentSpellSlots = character
      ? getCurrentSpellSlots(character)
      : undefined;
    if (currentSpellSlots && currentSpellSlots.available > 0 && character) {
      const newSpellSlots: SpellSlotLevel = {
        level: currentSpellSlots.level,
        available: currentSpellSlots.available - 1,
        used:
          currentSpellSlots.used === currentSpellSlots.available
            ? currentSpellSlots.used - 1
            : currentSpellSlots.used,
      };
      const newCharacter: Character = {
        ...character,
        spellSlots: character.spellSlots.map((value) => {
          if (value.level === newSpellSlots.level) {
            return newSpellSlots;
          } else {
            return value;
          }
        }),
      };
      await upsertCharacter(newCharacter);
      setCharacter(newCharacter);
    }
  };

  const markSpellSlotUsed = async (character: Character) => {
    const newCharacter: Character = {
      ...character,
      spellSlots: [],
    };
    // TODO: Bäda implements logic

    //await upsertCharacter(newCharacter);
  };

  const resetSpellSlot = async (character: Character) => {
    const newCharacter: Character = {
      ...character,
      spellSlots: [],
    };
    // TODO: Bäda implements logic

    //await upsertCharacter(newCharacter);
  };

  const handleSpellSlotClick = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
    const newValue = event.target.checked;
    if (character) {
      if (newValue) {
        await markSpellSlotUsed(character);
      } else {
        await resetSpellSlot(character);
      }
    }
  };

  const addButtonDisabled = () => {
    return character ? getCurrentSpellSlots(character)?.available == 4 : false;
  };

  const removeButtonDisabled = () => {
    return character ? getCurrentSpellSlots(character)?.available == 0 : false;
  };

  const getCurrentSpellSlots = (char: Character) => {
    const spellSlots = char.spellSlots.find((spellSlots: SpellSlotLevel) => {
      return spellSlots.level === input.slotLevel;
    });
    return spellSlots;
  };

  return (
    <TableRow className="level-header body-row">
      <TableCell colSpan={4} className="spell-slot-control">
        <div className="control-container">
          <div className="slot-title-container">
            {input.slotLevel !== 0 ? `Level: ${input.slotLevel}` : 'Cantrips'}
          </div>
          <div className="slot-container">
            {(() => {
              const currentSlots = character
                ? getCurrentSpellSlots(character)
                : undefined;
              const checkBoxes = [];
              if (currentSlots && input.slotLevel !== 0) {
                for (let slot = 1; slot <= currentSlots.available; slot++) {
                  checkBoxes.push(
                    <Checkbox
                      size="small"
                      checked={slot <= currentSlots.used}
                      onChange={(e) => handleSpellSlotClick(e)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  );
                }
              }
              return checkBoxes;
            })()}
          </div>
          <div className="spell-slot-edit">
            {' '}
            {input.slotLevel === 0 ? (
              <div></div>
            ) : (
              <div>
                <IconButton
                  className="icon-button"
                  onClick={($event) =>
                    removeSpellSlot($event as unknown as MouseEvent)
                  }
                  disabled={removeButtonDisabled()}
                >
                  <Icon path={mdiMinus} size={1}></Icon>
                </IconButton>
                <IconButton
                  className="icon-button"
                  onClick={($event) =>
                    addSpellSlot($event as unknown as MouseEvent)
                  }
                  disabled={addButtonDisabled()}
                >
                  <Icon path={mdiPlus} size={1}></Icon>
                </IconButton>
              </div>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};
