import React, { ChangeEvent, useState } from 'react';
import {
  IconButton,
  Backdrop,
  Stack,
  Box,
  Slide,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
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
import { useThemeMode } from '../context/theme.context';
import { PrimaryTheme } from '../db/globalSettings';

const Settings: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { mode, toggleMode, appColor, setPrimaryColor } = useThemeMode();

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

  const handleAppColorChange = async (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setPrimaryColor(event.target.value as PrimaryTheme);
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
              <h5>Customization</h5>
              <Stack spacing={1}>
                <p
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '1rem',
                    paddingLeft: '1em',
                    paddingRight: '1em',
                  }}
                >
                  <div>Theme Mode</div>
                  <RadioGroup row value={mode} onChange={toggleMode}>
                    <FormControlLabel
                      value="light"
                      control={<Radio />}
                      label="Light"
                    />
                    <FormControlLabel
                      value="dark"
                      control={<Radio />}
                      label="Dark"
                    />
                  </RadioGroup>
                </p>
                <p
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '1rem',
                    paddingLeft: '1em',
                    paddingRight: '1em',
                  }}
                >
                  <div>App Color</div>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      labelId="theme-mode-label"
                      value={appColor}
                      //ty
                      onChange={(
                        e: any // eslint-disable-line @typescript-eslint/no-explicit-any
                      ) =>
                        handleAppColorChange(
                          e as unknown as ChangeEvent<{ value: unknown }>
                        )
                      }
                      label="Theme Mode"
                      variant="standard"
                    >
                      {Object.values(PrimaryTheme).map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </p>
              </Stack>
              <h5>Data</h5>
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
