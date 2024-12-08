import {useParams} from "react-router-dom";
import { getCharacter} from "../../service/CharacterService";
import { useNavigate } from "react-router-dom";
import {
    AppBar,
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
    Typography
} from "@mui/material";
import React, {useEffect, useState} from "react";
import Icon from "@mdi/react";
import {mdiChevronLeft} from "@mdi/js";
import {Character, classIcons, Spell} from "../../db/Types";
import './characterSpellLists.css'
import {fetchSpells, getSpellList$} from "../../service/SpellListService";

type SpellListType = 'ALL' | 'CLASS';

const spellListTypeDisplayDict: {[K in SpellListType]: string} = {
    ALL: "All",
    CLASS: "Class"
}

const tableFilters: {[K in SpellListType]: (x: Spell, char: Character) => boolean} = {
    ALL: (_x, _y) => true,
    CLASS: (spell: Spell, char: Character) => spell.classes.includes(char.class)
};

export function CharacterSpellLists () {
    const [activeTab, setActiveTab] = useState<SpellListType>("ALL");

    const [character, setCharacter] = useState<Character>();

    const [spells, setSpells] = useState<Spell[]>([]);

    const params = useParams()

    useEffect(() => {
        fetchSpells();
        const charId = parseInt(params.id ? params.id : '');
        getCharacter(charId).then(character => setCharacter(character));
        const subscription = getSpellList$().subscribe(setSpells); // Subscribe to the counter observable

        return () => subscription.unsubscribe(); // Cleanup subscription on unmount
    }, [params.id]);


    const handleTabChange = (event: any, newValue: SpellListType) => {
        setActiveTab(newValue);
    };

    const navigate = useNavigate();

    const filteredData = spells.filter(row => character ? tableFilters[activeTab](row, character) : true).sort((a, b) => a.level - b.level);

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
                    {character ? <Icon path={classIcons[character.class]} className='class-icon' size={1}></Icon> : ''} {character?.name}
                </Typography>
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
                <Tab label={spellListTypeDisplayDict['CLASS']} value="CLASS" />
                <Tab label={spellListTypeDisplayDict['ALL']} value="ALL" />
            </Tabs>
        </Paper>

        <TableContainer component={Paper} className='table'>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Level</TableCell>
                        <TableCell>Name</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody className='body'>
                    {filteredData.map((item) => (
                        <TableRow key={item.index}>
                            <TableCell>{item.level}</TableCell>
                            <TableCell>{item.name}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
</div>)
}