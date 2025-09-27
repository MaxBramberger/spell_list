import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { getCharacter$, upsertCharacter } from '../../service/CharacterService';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  Toolbar,
  Typography,
} from '@mui/material';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiCancel,
  mdiChevronLeft,
  mdiClose,
  mdiCloseCircleOutline,
  mdiMagnify,
} from '@mdi/js';
import { Character, classIcons, Spell, SpellListType } from '../../db/Types';
import './characterSpellLists.css';
import '../../App.css';
import { fetchSpells, getSpellList$ } from '../../service/SpellListService';
import { combineLatest } from 'rxjs';
import { CharacterSpellListMapper } from '../characterSpellListMapper';
import { SpellSlotControl } from './spellSlotControl';
import ToggleButton from '../../shared/toggleButton';
import SpellSlotManagement, { getMaxLevel } from '../dialog/spellSlotManagment';

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
  activeTab: SpellListType,
  searchString: string = ''
): SpellWithKnownAndPrepared[] {
  return spells
    .filter((row) => {
      return searchString
        ? JSON.stringify(row).toLowerCase().includes(searchString.toLowerCase())
        : true;
    })
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

  const [searchBarExpanded, setSearchBarExpanded] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchString, setSearchString] = useState<string>('');

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

  useEffect(() => {
    if (character) {
      const subscription = getCharacter$(character.uuid).subscribe(
        (charFromDb) => {
          setCharacter(charFromDb);
        }
      );
      return () => subscription.unsubscribe();
    }
  }, [character]);

  const checkTableInit = () => {
    if (tableRef.current?.scrollTop === location.state?.spellListScrollTop) {
      location.state = {};
    }
  };

  const toggleSearchBar = () => {
    setSearchBarExpanded(!searchBarExpanded);
    setSearchString('');

    if (!searchBarExpanded) {
      setTimeout(() => {
        if (searchInputRef.current) {
          const inputElement: HTMLInputElement | null =
            searchInputRef.current.querySelector('input');
          if (inputElement) {
            inputElement.focus();
          }
        }
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
        getDisplayedSpells(newSpells, newCharacter, activeTab, searchString)
      );
    });

    return () => subscription.unsubscribe(); // Cleanup subscription on unmount
  }, [params.id, activeTab, hasPreparedList, hasKnownList, searchString]);

  const handleTabChange = (event: unknown, newValue: SpellListType) => {
    setShowKnownCheckBox(newValue !== 'Prepared' && hasKnownList);
    setShowPreparedCheckBox(
      (newValue === 'Known' || newValue === 'Prepared' || !hasKnownList) &&
        hasPreparedList
    );
    setDisplayedSpells(
      getDisplayedSpells(spells, character, newValue, searchString)
    );
    setActiveTab(newValue);
  };

  const handleKnownCheckBoxChange = async (spell: Spell, known: boolean) => {
    if (character) {
      if (!known) {
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
      setDisplayedSpells(
        getDisplayedSpells(spells, character, activeTab, searchString)
      );
    }
  };

  const handlePreparedCheckBoxChange = async (
    spell: Spell,
    prepared: boolean
  ) => {
    if (character) {
      if (!prepared) {
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
      setDisplayedSpells(
        getDisplayedSpells(spells, character, activeTab, searchString)
      );
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
          <IconButton color="inherit" onClick={() => toggleSearchBar()}>
            <Icon size={1} path={mdiMagnify}></Icon>
          </IconButton>
          <SpellSlotManagement character={character} />
        </Toolbar>
      </AppBar>
      {searchBarExpanded && (
        <Paper>
          <div className="searchbar-container">
            <OutlinedInput
              className="search-input"
              ref={searchInputRef}
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <Icon className="search-icon" path={mdiMagnify} size={1} />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => toggleSearchBar()}>
                    <Icon className="search-icon" path={mdiClose} size={1} />
                  </IconButton>
                </InputAdornment>
              }
            ></OutlinedInput>
          </div>
        </Paper>
      )}
      <Paper className="table-paper">
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
          <TableBody className="body">
            {displayedSpells.reduce(
              (previous: ReactElement[], item, currentIndex, someArray) => {
                const previousSpell = displayedSpells[currentIndex - 1];
                if (previousSpell && previousSpell.level !== item.level) {
                  for (
                    let levelDiff = 1;
                    levelDiff <= item.level - previousSpell.level;
                    levelDiff++
                  ) {
                    previous.push(
                      <SpellSlotControl
                        character={character!}
                        slotLevel={previousSpell.level + levelDiff}
                      ></SpellSlotControl>
                    );
                  }
                } else if (!previousSpell) {
                  previous.push(
                    <SpellSlotControl
                      character={character!}
                      slotLevel={item.level}
                    ></SpellSlotControl>
                  );
                }
                previous.push(
                  <TableRow
                    key={item.index}
                    className="body-row"
                    onClick={() => handleSpellClick(item)}
                    ref={(el) => rowRefs.current.set(item.index, el)}
                  >
                    <TableCell>
                      {item.name}
                      {item.ritual && <sup className="tag">R</sup>}
                      {item.concentration && <sup className="tag">C</sup>}
                    </TableCell>

                    <TableCell>
                      <div className="button-container">
                        {showPreparedCheckBox && activeTab !== 'Prepared' && (
                          <ToggleButton
                            text="Prepared"
                            toggled={item.prepared}
                            callback={() =>
                              handlePreparedCheckBoxChange(item, item.prepared)
                            }
                          />
                        )}
                        {showKnownCheckBox &&
                          activeTab !== 'Prepared' &&
                          activeTab !== 'Known' && (
                            <ToggleButton
                              text="Known"
                              toggled={item.known}
                              callback={() =>
                                handleKnownCheckBoxChange(item, item.known)
                              }
                            />
                          )}
                        {activeTab !== 'All' && activeTab !== 'Class' && (
                          <IconButton
                            color={'primary'}
                            className="icon-button"
                            onClick={async ($event) => {
                              $event.stopPropagation();
                              if (activeTab === 'Prepared') {
                                await handlePreparedCheckBoxChange(item, true);
                              } else {
                                await handleKnownCheckBoxChange(item, true);
                              }
                            }}
                          >
                            <Icon path={mdiCloseCircleOutline} size={1}></Icon>
                          </IconButton>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
                if (currentIndex === someArray.length - 1 && character) {
                  const maxLevel = getMaxLevel(character);
                  character.spellSlots.forEach((spellSlotLevel) => {
                    if (
                      spellSlotLevel.level > item.level &&
                      spellSlotLevel.level <= maxLevel
                    ) {
                      previous.push(
                        <SpellSlotControl
                          character={character}
                          slotLevel={spellSlotLevel.level}
                        />
                      );
                    }
                  });
                }

                return previous;
              },
              []
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
