import {useParams} from "react-router-dom";
import {getCharacter$, updateCharacter} from "../../service/CharacterService";
import { useNavigate } from "react-router-dom";
import {
    AppBar, Checkbox,
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
    Toolbar, Tooltip,
    Typography
} from "@mui/material";
import React, {useEffect, useState} from "react";
import Icon from "@mdi/react";
import {mdiChevronLeft, mdiDownload, mdiUpload} from "@mdi/js";
import {Character, classIcons, Spell, SpellListType} from "../../db/Types";
import './characterSpellLists.css'
import {fetchSpells, getSpellList$, importSpells} from "../../service/SpellListService";
import {combineLatest} from "rxjs";
import {CharacterSpellListMapper} from "../characterSpellListMapper";


const tableFilters: {[K in SpellListType]: (x: Spell, char: Character) => boolean} = {
    All: (_x, _y) => true,
    Class: (spell: Spell, char: Character) => spell.classes.some(spellClass => char.classes.map(charClass => charClass.name).includes(spellClass)),
    Known: (spell: Spell, char: Character) => {
        const knownList = char.knownSpellIndices;
        return knownList ? knownList.includes(spell.index) : false;

    },
    Prepared: (spell: Spell, char: Character) => {
        const prepareList = char.preparedSpellIndices;
        return prepareList ? prepareList.includes(spell.index) : false;

    }
};

interface SpellWithKnownAndPrepared extends Spell {
    known: boolean,
    prepared: boolean
}

function getDisplayedSpells(spells: Spell[], character: Character | undefined, activeTab: SpellListType): SpellWithKnownAndPrepared[]{
    return spells
        .filter(row => character ? tableFilters[activeTab](row, character) : true)
        .sort((a, b) => a.level - b.level).map( spell => {
            const knownList = character?.knownSpellIndices;
            const known = knownList ? knownList.includes(spell.index) : false;
            const preparedList = character?.preparedSpellIndices;
            const prepared = preparedList ? preparedList.includes(spell.index) : false;
            return {...spell, known: known, prepared: prepared}
        });
}

export function CharacterSpellLists () {
    const [activeTab, setActiveTab] = useState<SpellListType>("Class");
    const [character, setCharacter] = useState<Character>();
    const [spells, setSpells] = useState<Spell[]>([]);
    const [hasKnownList, setHasKnownList] = useState<boolean>(false);
    const [hasPreparedList, setHasPreparedList] = useState<boolean>(false);
    const [showKnownCheckBox, setShowKnownCheckBox] = useState<boolean>(false);
    const [showPreparedCheckBox, setShowPreparedCheckBox] = useState<boolean>(false);
    const [displayedSpells, setDisplayedSpells] = useState<SpellWithKnownAndPrepared[]>([])

    const params = useParams()

    useEffect(() => {
        fetchSpells();
        const charId = params.id ? params.id : '';
        const subscription = combineLatest([getCharacter$(charId), getSpellList$()]).subscribe(([newCharacter, newSpells]) =>{
            setSpells(newSpells);
            setCharacter(newCharacter);
            if(newCharacter){
                const spellLists = new CharacterSpellListMapper(newCharacter).getLists();
                setHasKnownList(spellLists.includes('Known'));
                setHasPreparedList(spellLists.includes('Prepared'));
                setShowKnownCheckBox(activeTab !== 'Prepared' && hasKnownList)
                setShowPreparedCheckBox((activeTab === 'Known' || activeTab === 'Prepared' || !hasKnownList) && hasPreparedList)
            }
            setDisplayedSpells(getDisplayedSpells(newSpells, newCharacter, activeTab));
        }); // Subscribe to the counter observable

        return () => subscription.unsubscribe(); // Cleanup subscription on unmount
    }, [params.id, activeTab, hasPreparedList, hasKnownList]);


    const handleTabChange = (event: any, newValue: SpellListType) => {
        setShowKnownCheckBox(newValue !== 'Prepared' && hasKnownList)
        setShowPreparedCheckBox((newValue === 'Known' || newValue === 'Prepared' || !hasKnownList) && hasPreparedList)
        setDisplayedSpells(getDisplayedSpells(spells, character, newValue))
        setActiveTab(newValue);
    };

    const downloadSpellList = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(spells, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "spells.json";

        link.click();
    }

    const uploadSpellList = (): void => {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.click(); // Trigger file input click
        }
    };

    const handleFileImport =  (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string; // Ensure the result is a string
                    const data: Spell[] = JSON.parse(text); // Parse JSON data
                    const newData: Spell[] = [];
                    data.forEach(spell => {
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
                            subclasses: spell.subclasses
                        })
                    })

                    importSpells(newData); // Update state with parsed JSON
                } catch (error) {
                    console.error('Error parsing JSON file:', error);
                    alert('Invalid JSON file.');
                }
            };
            reader.readAsText(file);
        }
    }

    const handleKnownCheckBoxChange = async (spell: Spell, event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        const newValue = event.target.checked;
        if(character){
           if(newValue){
                const spellIndexSet = new Set(character.knownSpellIndices).add(spell.index);
                character.knownSpellIndices = Array.from(spellIndexSet.values());
                await updateCharacter(character);
           } else {
               const spellIndexSet = new Set(character.knownSpellIndices);
               spellIndexSet.delete(spell.index);
               character.knownSpellIndices = Array.from(spellIndexSet.values());

               const preparedIndexSet = new Set(character.preparedSpellIndices);
               preparedIndexSet.delete(spell.index);
               character.preparedSpellIndices = Array.from(preparedIndexSet);
               await updateCharacter(character)
           }
           setDisplayedSpells(getDisplayedSpells(spells, character, activeTab));
        }
    }

    const handlePreparedCheckBoxChange = async (spell: Spell, event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        const newValue = event.target.checked;
        if(character){
            if(newValue){
                const spellIndexSet = new Set(character.preparedSpellIndices).add(spell.index);
                character.preparedSpellIndices = Array.from(spellIndexSet.values());
                await updateCharacter(character);

            } else {
                const spellIndexSet = new Set(character.preparedSpellIndices);
                spellIndexSet.delete(spell.index);
                character.preparedSpellIndices = Array.from(spellIndexSet.values());
                await updateCharacter(character);
            }
            setDisplayedSpells(getDisplayedSpells(spells, character, activeTab));
        }
    }


    const navigate = useNavigate();

    return (
    <div className='page-container'>
        <AppBar position="static">
            <Toolbar className='tool-bar'>
                <IconButton
                    color="inherit"
                    onClick={() => navigate("/")}
                >
                    <Icon path={mdiChevronLeft} size={1}></Icon>
                </IconButton>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    {character ? character.classes.map(characterClass => (<Icon className='class-icon' path={classIcons[characterClass.name]}></Icon>)) : ''} {character?.name}
                </Typography>
                <Tooltip title='Download spell list'>
                    <IconButton color="inherit" onClick={downloadSpellList}>
                        <Icon path={mdiDownload} size={1}></Icon>
                    </IconButton>
                </Tooltip>
                <Tooltip title='Import spell list'>
                <IconButton color="inherit" onClick={uploadSpellList}>
                    <Icon path={mdiUpload} size={1}></Icon>
                    <input
                        type="file"
                        id="fileInput"
                        style={{display: 'none'}}
                        onChange={handleFileImport}
                        accept=".json" // Restrict to certain file types
                    />
                </IconButton>
                </Tooltip>
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
                {hasPreparedList && <Tab label='Prepared' value='Prepared'/>}
                {hasKnownList && <Tab label='Known' value='Known'/>}
                <Tab label='Class' value="Class" />
                <Tab label='All' value="All" />
            </Tabs>
        </Paper>

        <TableContainer component={Paper} className='table'>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Level</TableCell>
                        <TableCell>Name</TableCell>
                        { showPreparedCheckBox && <TableCell> Prepared </TableCell>}
                        { showKnownCheckBox && <TableCell> Known </TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody className='body'>
                    {displayedSpells.map((item) => (
                        <TableRow key={item.index}>
                            <TableCell>{item.level}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            {
                                showPreparedCheckBox &&
                                <TableCell>
                                    <Checkbox
                                        size='small'
                                        checked={item.prepared}
                                        onChange={
                                            (e) => handlePreparedCheckBoxChange(item, e)
                                        }
                                    />
                                </TableCell>
                            }
                            {
                                showKnownCheckBox &&
                                <TableCell>
                                    <Checkbox
                                        size='small'
                                        checked={item.known}
                                        onChange={
                                            (e) => handleKnownCheckBoxChange(item, e)
                                        }
                                    />
                                </TableCell>
                            }
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
</div>)
}