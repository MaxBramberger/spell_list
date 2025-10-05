import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import { addCharacter } from '../service/CharacterService';
import {
  CharacterClassName,
  charClassDict,
  initialSpellSlots,
} from '../db/Types';
import Icon from '@mdi/react';
import { mdiChevronLeft } from '@mdi/js';
import { v4 as uuidv4 } from 'uuid';
import '../App.css';

export const CreateCharacter: React.FC = () => {
  const navigate = useNavigate();

  // State to store the character name
  const [characterName, setCharacterName] = useState<string>('');

  // State to store the selected character class
  const [characterClasses, setCharacterClasses] = useState<
    CharacterClassName[]
  >([]);

  const classes = Object.values(charClassDict);

  const handleCreateCharacter = async () => {
    if (characterName.trim() && characterClasses) {
      const newUuid = uuidv4();
      await addCharacter({
        uuid: newUuid,
        classes: characterClasses.map((charClass) => {
          return { name: charClass, level: 1 };
        }),
        name: characterName,
        knownSpellIndices: [],
        preparedSpellIndices: [],
        spellSlots: initialSpellSlots,
      });
      setCharacterName('');
      setCharacterClasses([]);
      navigate('/');
    } else {
      alert('Please enter a valid character name and select a class.');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate('/')}>
            <Icon path={mdiChevronLeft} size={1}></Icon>
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Create a Character
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Form */}
      <Container style={{ marginTop: '20px' }}>
        <TextField
          fullWidth
          label="Character Name"
          variant="outlined"
          margin="normal"
          value={characterName}
          onChange={(e) => setCharacterName(e.target.value)}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="character-class-label">Character Class</InputLabel>
          <Select
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
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: '10px' }}
          disabled={!characterClasses || !characterName.trim()}
          onClick={handleCreateCharacter}
        >
          Create Character
        </Button>
      </Container>
    </div>
  );
};
