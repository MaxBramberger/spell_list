import React, { useState } from 'react';
import { IconButton, Backdrop, Stack, Box, Slide } from '@mui/material';
import Icon from '@mdi/react';
import {
  mdiAccountArrowUp,
  mdiCancel,
  mdiCog,
  mdiDownload,
  mdiUpload,
} from '@mdi/js';
import {
  clearSpellList,
  getSpellList$,
  importSpells,
} from '../service/SpellListService';
import { Spell } from '../db/Types';
import ConfirmationDialog from '../dialog/confirmationDialog';
import './settings.css';
import { firstValueFrom } from 'rxjs';
import ButtonRow from '../shared/buttonRow';
import { handleCharacterFileImport } from '../importer/CharacterIO';

const Settings: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const downloadSpellList = async () => {
    const spells = await firstValueFrom(getSpellList$());
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(spells, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'spells.json';

    link.click();
  };

  const uploadSpellList = (): void => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click(); // Trigger file input click
    }
  };

  const importCharacter = (): void => {
    const fileInput = document.getElementById(
      'characterInput'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click(); // Trigger file input click
    }
  };

  const handleSpellFileImport = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string; // Ensure the result is a string
          const data: Spell[] = JSON.parse(text); // Parse JSON data
          const newData: Spell[] = [];
          data.forEach((spell) => {
            // TODO: Validation missing
            newData.push({
              index: spell.index,
              casting_time: spell.casting_time,
              classes: spell.classes,
              components: spell.components,
              desc: spell.desc,
              concentration: spell.concentration,
              duration: spell.duration,
              higher_level: spell.higher_level,
              level: spell.level,
              name: spell.name,
              material: spell.material,
              range: spell.range,
              ritual: spell.ritual,
              school: spell.school,
              subclasses: spell.subclasses,
            });
          });

          importSpells(newData); // Update state with parsed JSON
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          alert('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteDialogConfirm = async () => {
    setDeleteDialogOpen(false);
    await clearSpellList();
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
              <Stack spacing={1}>
                <ButtonRow
                  icon={<Icon path={mdiAccountArrowUp} size={1} />}
                  label="Import Character"
                  onClick={importCharacter}
                />
                <input
                  type="file"
                  id="characterInput"
                  style={{ display: 'none' }}
                  onChange={handleCharacterFileImport}
                  accept=".json" // Restrict to certain file types
                />
                <ButtonRow
                  icon={<Icon path={mdiDownload} size={1} />}
                  label="Export Spells"
                  onClick={downloadSpellList}
                />
                <ButtonRow
                  icon={<Icon path={mdiUpload} size={1} />}
                  label="Import Spells"
                  onClick={uploadSpellList}
                />
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: 'none' }}
                  onChange={handleSpellFileImport}
                  accept=".json" // Restrict to certain file types
                />
                <ButtonRow
                  icon={<Icon path={mdiCancel} size={1} />}
                  label="Delete Spell Data"
                  color={'#f44336'}
                  onClick={() => setDeleteDialogOpen(true)}
                />
              </Stack>
            </Box>
          </Box>
        </Slide>
        <ConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleDeleteDialogClose}
          onConfirm={() => handleDeleteDialogConfirm()}
          title="Clear spell data"
          message={
            'Are you sure you want to clear all spell data from the app.'
          }
        />
      </Backdrop>
    </>
  );
};

export default Settings;
