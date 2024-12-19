import { IconButton, Tooltip } from '@mui/material';
import Icon from '@mdi/react';
import { mdiDownload, mdiUpload } from '@mdi/js';
import React from 'react';
import { Character } from '../db/Types';
import {
  fetchCharacters,
  getCharacter$,
  upsertCharacter,
} from '../service/CharacterService';
import { firstValueFrom } from 'rxjs';

export const CharacterImport = () => {
  const importCharacter = (): void => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click(); // Trigger file input click
    }
  };

  const handleFileImport = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string; // Ensure the result is a string
          const data: Character = JSON.parse(text); // Parse JSON data
          await upsertCharacter(data);
          await fetchCharacters();
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          alert('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Tooltip title="Import character">
      <IconButton color="inherit" onClick={importCharacter}>
        <Icon path={mdiUpload} size={1}></Icon>
        <input
          type="file"
          id="fileInput"
          style={{ display: 'none' }}
          onChange={handleFileImport}
          accept=".json" // Restrict to certain file types
        />
      </IconButton>
    </Tooltip>
  );
};

interface CharacterExporterPros {
  uuid: string;
}

export const CharacterExporter: React.FC<CharacterExporterPros> = ({
  uuid,
}) => {
  const downloadCharacter = async () => {
    const character = await firstValueFrom(getCharacter$(uuid));
    if (character) {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(character, null, 2)
      )}`;
      const link = document.createElement('a');
      link.href = jsonString;
      link.download = 'character.json';

      link.click();
    }
  };

  return (
    <Tooltip title="Export character">
      <IconButton color="inherit" onClick={downloadCharacter}>
        <Icon path={mdiDownload} size={1} color={'rgba(0, 0, 0, 0.54)'}></Icon>
      </IconButton>
    </Tooltip>
  );
};
