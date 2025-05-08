import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { getCharacter$, upsertCharacter } from '../../service/CharacterService';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Checkbox,
  IconButton,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Toolbar,
  Typography,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import Icon from '@mdi/react';
import { mdiChevronLeft } from '@mdi/js';
import { Character, classIcons, Spell, SpellListType } from '../../db/Types';
import './characterSpellLists.css';
import '../../App.css';
import { fetchSpells, getSpellList$ } from '../../service/SpellListService';
import { combineLatest } from 'rxjs';
import { CharacterSpellListMapper } from '../characterSpellListMapper';
import SpellListSettings from './spellListSettings';

const tableFilters: {
  [K in SpellListType]: (x: Spell, char: Character) => boolean;
} = {
  All: () => true,
  Class: (spell: Spell, char: Character) =>
    spell.classes.some((spellClass) =>
      char.classes.map((charClass) => charClass.name).includes(spellClass)
    ),
  Known: (spell: Spell, char: Character) => {
    const knownList = char.knownSpellIndices;
    return knownList ? knownList.includes(spell.index) : false;
  },
  Prepared: (spell: Spell, char: Character) => {
    const prepareList = char.preparedSpellIndices;
    return prepareList ? prepareList.includes(spell.index) : false;
  },
};

interface SpellWithKnownAndPrepared extends Spell {
  known: boolean;
  prepared: boolean;
}

function getDisplayedSpells(
  spells: Spell[],
  character: Character | undefined,
  activeTab: SpellListType
): SpellWithKnownAndPrepared[] {
  return spells
    .filter((row) =>
      character ? tableFilters[activeTab](row, character) : true
    )
    .sort((a, b) => a.level - b.level)
    .map((spell) => {
      const knownList = character?.knownSpellIndices;
      const known = knownList ? knownList.includes(spell.index) : false;
      const preparedList = character?.preparedSpellIndices;
      const prepared = preparedList
        ? preparedList.includes(spell.index)
        : false;
      return { ...spell, known: known, prepared: prepared };
    });
}

export function CharacterSpellLists() {
  const rowRefs = useRef(new Map());
  const [tableInitialized, setTableInitialized] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableRef = useRef<any>(null);
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<SpellListType>('Class');
  const [character, setCharacter] = useState<Character>();
  const [spells, setSpells] = useState<Spell[]>([]);
  const [hasKnownList, setHasKnownList] = useState<boolean>(false);
  const [hasPreparedList, setHasPreparedList] = useState<boolean>(false);
  const [showKnownCheckBox, setShowKnownCheckBox] = useState<boolean>(false);
  const [showPreparedCheckBox, setShowPreparedCheckBox] =
    useState<boolean>(false);
  const [displayedSpells, setDisplayedSpells] = useState<
    SpellWithKnownAndPrepared[]
  >([]);

  const params = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (
      location.state?.spellListScrollTop !== undefined &&
      tableRef.current !== location.state.spellListScrollTop
    ) {
      tableRef.current.scrollTop = location.state.spellListScrollTop;
    }
    setTableInitialized(true);
  }, [location, tableRef, displayedSpells, tableInitialized]);

  const checkTableInit = () => {
    if (tableRef.current?.scrollTop === location.state?.spellListScrollTop) {
      location.state = {};
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const scrollToRow = (key: string) => {
    const rowRef = rowRefs.current.get(key);
    if (rowRef) {
      // Scroll to the row
      rowRef.scrollIntoView({
        behavior: 'auto',
        block: 'center',
      });
    }
  };

  useEffect(() => {
    const activeTabQueried = searchParams.get('activeTab');
    if (activeTabQueried) {
      if (activeTabQueried === 'Prepared' && !hasPreparedList) {
        return;
      }
      if (activeTabQueried === 'Known' && !hasKnownList) {
        return;
      }
      setActiveTab(activeTabQueried as SpellListType);
    }
  }, [hasKnownList, hasPreparedList, searchParams]);

  useEffect(() => {
    fetchSpells();
    const charId = params.id ? params.id : '';
    const subscription = combineLatest([
      getCharacter$(charId),
      getSpellList$(),
    ]).subscribe(([newCharacter, newSpells]) => {
      setSpells(newSpells);
      setCharacter(newCharacter);
      if (newCharacter) {
        const spellLists = new CharacterSpellListMapper(
          newCharacter
        ).getLists();
        setHasKnownList(spellLists.includes('Known'));
        setHasPreparedList(spellLists.includes('Prepared'));
        setShowKnownCheckBox(activeTab !== 'Prepared' && hasKnownList);
        setShowPreparedCheckBox(
          (activeTab === 'Known' ||
            activeTab === 'Prepared' ||
            !hasKnownList) &&
            hasPreparedList
        );
      }
      setDisplayedSpells(
        getDisplayedSpells(newSpells, newCharacter, activeTab)
      );
    });

    return () => subscription.unsubscribe(); // Cleanup subscription on unmount
  }, [params.id, activeTab, hasPreparedList, hasKnownList]);

  const handleTabChange = (event: unknown, newValue: SpellListType) => {
    setShowKnownCheckBox(newValue !== 'Prepared' && hasKnownList);
    setShowPreparedCheckBox(
      (newValue === 'Known' || newValue === 'Prepared' || !hasKnownList) &&
        hasPreparedList
    );
    setDisplayedSpells(getDisplayedSpells(spells, character, newValue));
    setActiveTab(newValue);
  };

  const handleKnownCheckBoxChange = async (
    spell: Spell,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
    const newValue = event.target.checked;
    if (character) {
      if (newValue) {
        const spellIndexSet = new Set(character.knownSpellIndices).add(
          spell.index
        );
        character.knownSpellIndices = Array.from(spellIndexSet.values());
        await upsertCharacter(character);
      } else {
        const spellIndexSet = new Set(character.knownSpellIndices);
        spellIndexSet.delete(spell.index);
        character.knownSpellIndices = Array.from(spellIndexSet.values());

        const preparedIndexSet = new Set(character.preparedSpellIndices);
        preparedIndexSet.delete(spell.index);
        character.preparedSpellIndices = Array.from(preparedIndexSet);
        await upsertCharacter(character);
      }
      setDisplayedSpells(getDisplayedSpells(spells, character, activeTab));
    }
  };

  const handlePreparedCheckBoxChange = async (
    spell: Spell,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
    const newValue = event.target.checked;
    if (character) {
      if (newValue) {
        const spellIndexSet = new Set(character.preparedSpellIndices).add(
          spell.index
        );
        character.preparedSpellIndices = Array.from(spellIndexSet.values());
        await upsertCharacter(character);
      } else {
        const spellIndexSet = new Set(character.preparedSpellIndices);
        spellIndexSet.delete(spell.index);
        character.preparedSpellIndices = Array.from(spellIndexSet.values());
        await upsertCharacter(character);
      }
      setDisplayedSpells(getDisplayedSpells(spells, character, activeTab));
    }
  };

  const handleSpellClick = (item: Spell) => {
    const charId = character?.uuid;
    if (charId) {
      navigate(`/spell/${item.index}?charId=${charId}&activeTab=${activeTab}`, {
        state: { spellListScrollTop: tableRef.current.scrollTop },
      });
    } else {
      navigate(`/spell/${item.index}`);
    }
  };

  const showTable: React.CSSProperties = {
    visibility: !tableInitialized ? 'hidden' : 'visible',
  };

  const navigate = useNavigate();

  return (
    <div className="page-container">
      <AppBar position="static">
        <Toolbar className="tool-bar">
          <IconButton color="inherit" onClick={() => navigate('/')}>
            <Icon path={mdiChevronLeft} size={1}></Icon>
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            {character
              ? character.classes.map((characterClass) => (
                  <Icon
                    key={characterClass.name}
                    className="class-icon"
                    path={classIcons[characterClass.name]}
                  ></Icon>
                ))
              : ''}{' '}
            {character?.name}
          </Typography>
          <SpellListSettings />
        </Toolbar>
      </AppBar>

      <Paper>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          {hasPreparedList && <Tab label="Prepared" value="Prepared" />}
          {hasKnownList && <Tab label="Known" value="Known" />}
          <Tab label="Class" value="Class" />
          <Tab label="All" value="All" />
        </Tabs>
      </Paper>

      <TableContainer
        component={Paper}
        className="table"
        ref={tableRef}
        style={showTable}
        onScroll={checkTableInit}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Level</TableCell>
              <TableCell>Name</TableCell>
              <TableCell> {showPreparedCheckBox && 'Prepared'}</TableCell>
              <TableCell> {showKnownCheckBox && 'Known'} </TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="body">
            {displayedSpells.map((item) => (
              <TableRow
                key={item.index}
                className="body-row"
                onClick={() => handleSpellClick(item)}
                ref={(el) => rowRefs.current.set(item.index, el)}
              >
                <TableCell>{item.level}</TableCell>
                <TableCell>
                  {item.name}
                  {item.ritual && <sup className="tag">R</sup>}
                  {item.concentration && <sup className="tag">C</sup>}
                </TableCell>

                <TableCell>
                  {showPreparedCheckBox && (
                    <Checkbox
                      size="small"
                      checked={item.prepared}
                      onChange={(e) => handlePreparedCheckBoxChange(item, e)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </TableCell>

                <TableCell>
                  {showKnownCheckBox && (
                    <Checkbox
                      size="small"
                      checked={item.known}
                      onChange={(e) => handleKnownCheckBoxChange(item, e)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
