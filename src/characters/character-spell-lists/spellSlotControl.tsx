import { Character, SpellSlotLevel } from '../../db/Types';
import { Checkbox, IconButton, TableCell, TableRow } from '@mui/material';
import React from 'react';
import Icon from '@mdi/react';
import { mdiMinus, mdiPlus } from '@mdi/js';
import './spellSlotControl.css';
import { upsertCharacter } from '../../service/CharacterService';

export interface SpellSlotControlInput {
  character: Character;
  slotLevel: number;
}

const markSpellSlotUsed = async (character: Character) => {
  const newCharacter: Character = {
    ...character,
    spellSlots: [],
  };
  // TODO: Bäda implements logic

  await upsertCharacter(newCharacter);
};

const resetSpellSlot = async (character: Character) => {
  const newCharacter: Character = {
    ...character,
    spellSlots: [],
  };
  // TODO: Bäda implements logic

  await upsertCharacter(newCharacter);
};

export const SpellSlotControl = (input: SpellSlotControlInput) => {
  const addSpellSlot = async (event: MouseEvent) => {
    event.stopPropagation();

    const newCharacter: Character = {
      ...input.character,
      spellSlots: [],
    };
    // TODO: Bäda implements logic

    await upsertCharacter(newCharacter);
  };

  const removeSpellSlot = async (event: MouseEvent) => {
    event.stopPropagation();

    const newCharacter: Character = {
      ...input.character,
      spellSlots: [],
    };
    // TODO: Bäda implements logic

    await upsertCharacter(newCharacter);
  };

  const handleSpellSlotClick = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
    const newValue = event.target.checked;
    if (newValue) {
      await markSpellSlotUsed(input.character);
    } else {
      await resetSpellSlot(input.character);
    }
  };

  const getCurrentSpellSlots = () => {
    const spellSlots = input.character.spellSlots.find(
      (spellSlots: SpellSlotLevel) => {
        return spellSlots.level === input.slotLevel;
      }
    );
    return spellSlots;
  };

  return (
    <TableRow className="level-header">
      <TableCell colSpan={4} className="spell-slot-control">
        <div>
          Level {input.slotLevel}
          {(() => {
            const currentSlots = getCurrentSpellSlots();
            const checkBoxes = [];
            if (currentSlots) {
              for (let slot = 0; slot < currentSlots.available; slot++) {
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
        <IconButton
          className="icon-button"
          onClick={($event) => addSpellSlot($event as unknown as MouseEvent)}
        >
          <Icon path={mdiPlus} size={1}></Icon>
        </IconButton>
        <IconButton
          className="icon-button"
          onClick={($event) => removeSpellSlot($event as unknown as MouseEvent)}
        >
          <Icon path={mdiMinus} size={1}></Icon>
        </IconButton>
      </TableCell>
    </TableRow>
  );
};
