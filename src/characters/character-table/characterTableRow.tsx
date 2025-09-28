import { IconButton, TableCell, TableRow } from '@mui/material';
import Icon from '@mdi/react';
import { Character, classIcons } from '../../db/Types';
import { CharacterExporter } from '../../importer/CharacterIO';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useState } from 'react';
import ConfirmationDialog from '../../dialog/confirmationDialog';
import {
  deleteCharacter,
  fetchCharacters,
} from '../../service/CharacterService';
import { useNavigate } from 'react-router-dom';

interface CharacterTableRowData {
  character: Character;
}

export const CharacterTableRow = (param: CharacterTableRowData) => {
  const [dialogCharacter, setDialogCharacter] = useState<Character | undefined>(
    undefined
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleCloseDialog = () => {
    setDialogCharacter(undefined);
    setDialogOpen(false);
  };

  const handleConfirmAction = async () => {
    setDialogOpen(false);
    if (dialogCharacter) {
      await deleteCharacter(dialogCharacter.uuid);
    }
    fetchCharacters();
  };

  const handleRowClick = (row: Character) => {
    navigate(`/character/${row.uuid}`);
  };

  const handleDeleteClick = async (row: Character, event: MouseEvent) => {
    setDialogCharacter(row);
    event.stopPropagation();
    setDialogOpen(true);
  };

  return (
    <TableRow
      className="body-row"
      key={param.character.uuid}
      onClick={() => handleRowClick(param.character)}
    >
      <TableCell>
        {param.character.classes.map((characterClass) => (
          <Icon
            key={characterClass.name}
            className="class-icon"
            path={classIcons[characterClass.name]}
          ></Icon>
        ))}
      </TableCell>
      <TableCell>{param.character.name} </TableCell>
      <TableCell>
        {param.character.classes
          .map((characterClass) => characterClass.name)
          .join(', ')}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <CharacterExporter uuid={param.character.uuid} />
      </TableCell>
      <TableCell>
        {
          <div>
            <IconButton
              onClick={(e) =>
                handleDeleteClick(param.character, e as unknown as MouseEvent)
              }
            >
              <DeleteIcon />
            </IconButton>
          </div>
        }
      </TableCell>
      <ConfirmationDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={() => handleConfirmAction()}
        title="Delete"
        message={
          dialogCharacter
            ? `Are you sure you want to delete the character "${dialogCharacter.name}"?`
            : ''
        }
      />
    </TableRow>
  );
};
