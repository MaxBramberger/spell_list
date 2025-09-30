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
import {
  fetchCharacters,
  getCharacters$,
} from '../../service/CharacterService';
import { Character } from '../../db/Types';
import './characterTable.css';
import '../../App.css';
import Settings from '../../settings/settings';
import { CharacterTableRow } from './characterTableRow';

export const CharacterTable: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCharacters();
    const subscription = getCharacters$().subscribe(setCharacters); // Subscribe to the counter observable

    return () => subscription.unsubscribe(); // Cleanup subscription on unmount
  }, []);

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
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {characters.map((character) => (
              <CharacterTableRow key={character.uuid} character={character} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
