import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  deleteCharacter,
  fetchCharacters,
  getCharacters$,
} from '../../service/CharacterService';
import { Character, classIcons } from '../../db/Types';
import Icon from '@mdi/react';
import './characterTable.css';
import '../../App.css';
import ConfirmationDialog from '../../dialog/confirmationDialog';
import { CharacterExporter } from '../../importer/CharacterIO';
import Settings from '../../settings/settings';

export const CharacterTable: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [dialogCharacter, setDialogCharacter] = useState<Character | undefined>(
    undefined
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCharacters();
    const subscription = getCharacters$().subscribe(setCharacters); // Subscribe to the counter observable

    return () => subscription.unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleRowClick = (row: Character) => {
    navigate(`/character/${row.uuid}`);
  };

  const handleDeleteClick = async (row: Character, event: MouseEvent) => {
    setDialogCharacter(row);
    event.stopPropagation();
    setDialogOpen(true);
  };
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

  return (
    <div className="page-container">
      {/* Header with Icon Button */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Character List
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => navigate('/create-character')}
          >
            <AddIcon />
          </IconButton>
          <Settings />
        </Toolbar>
      </AppBar>

      {/* Table Displaying Characters */}
      <TableContainer
        component={Paper}
        style={{ marginTop: '20px' }}
        className="table"
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Export</TableCell>
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {characters.map((character) => (
              <TableRow
                className="body-row"
                key={character.uuid}
                onClick={() => handleRowClick(character)}
              >
                <TableCell>
                  {character.classes.map((characterClass) => (
                    <Icon
                      key={characterClass.name}
                      className="class-icon"
                      path={classIcons[characterClass.name]}
                    ></Icon>
                  ))}
                </TableCell>
                <TableCell>{character.name} </TableCell>
                <TableCell>
                  {character.classes
                    .map((characterClass) => characterClass.name)
                    .join(', ')}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <CharacterExporter uuid={character.uuid} />
                </TableCell>
                <TableCell>
                  {
                    <div>
                      <IconButton
                        onClick={(e) =>
                          handleDeleteClick(
                            character,
                            e as unknown as MouseEvent
                          )
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
    </div>
  );
};
