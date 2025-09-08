import React, { useEffect, useState } from 'react';
import {
  IconButton,
  Backdrop,
  Stack,
  Box,
  ButtonBase,
  Typography,
  Slide,
} from '@mui/material';
import Icon from '@mdi/react';
import { mdiCancel, mdiCog, mdiDownload, mdiUpload, mdiWeatherNight } from '@mdi/js';
import {
  clearSpellList,
  fetchSpells,
  getSpellList$,
  importSpells,
} from '../../service/SpellListService';
import { Character, Spell } from '../../db/Types';
import ConfirmationDialog from '../../dialog/confirmationDialog';
import './spellListSettings.css';
import { upsertCharacter } from '../../service/CharacterService';

interface SpellListSettingsParam{
  character?: Character
}

const SpellListSettings: React.FC<SpellListSettingsParam> = (param: SpellListSettingsParam) => {
  const [open, setOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [spells, setSpells] = useState<Spell[]>([]);

  useEffect(() => {
    fetchSpells();
    const subscription = getSpellList$().subscribe((newSpells) => {
      setSpells(newSpells);
    });

    return () => subscription.unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const downloadSpellList = () => {
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

  const longRest = async (): Promise<void> => {
    if (param.character) {
    const newCharacter: Character = {...param.character, spellSlots: param.character.spellSlots.map(spellSlotLevel => {
      return {...spellSlotLevel, used: 0}
    })};
    await upsertCharacter(newCharacter);
    }
  }

  const handleFileImport = (
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
                  icon={<Icon path={mdiDownload} size={1} />}
                  label="Export Spells"
                  onClick={downloadSpellList}
                />
                <ButtonRow
                  icon={<Icon path={mdiUpload} size={1} />}
                  label="Import Spells"
                  onClick={uploadSpellList}
                />
                {
                  param.character &&
                  <ButtonRow
                  icon={<Icon path={mdiWeatherNight} size={1} />}
                  label="Long rest"
                  onClick={longRest}
                />
                }
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: 'none' }}
                  onChange={handleFileImport}
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

type ButtonRowProps = {
  icon: React.ReactNode;
  label: string;
  color?: string;
  //eslint-disable-next-line
  onClick?: (x: any) => void;
};

const ButtonRow: React.FC<ButtonRowProps> = ({
  icon,
  label,
  color,
  onClick,
}) => {
  return (
    <ButtonBase
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'flex-start',
        p: 1.5,
        borderRadius: 1,
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        color: color ?? '',
      }}
      onClick={onClick}
    >
      <Box sx={{ mr: 2, height: 27 }}>{icon}</Box>
      <Typography sx={{ height: 27 }} variant="body1">
        {label}
      </Typography>
    </ButtonBase>
  );
};

export default SpellListSettings;
