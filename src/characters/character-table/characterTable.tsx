import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {deleteCharacter, fetchCharacters, getCharacters$} from "../../service/CharacterService";
import {Character, classIcons} from "../../db/Types";
import Icon from "@mdi/react";
import './characterTable.css';

export const CharacterTable: React.FC = () => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const navigate = useNavigate();

    fetchCharacters();

    useEffect(() => {
        const subscription = getCharacters$().subscribe(setCharacters); // Subscribe to the counter observable

        return () => subscription.unsubscribe(); // Cleanup subscription on unmount
    }, []);

    const handleRowClick = (row: Character) => {
        navigate(`/character/${row.id}`)
    };

    const handleDeleteClick = async (row: Character, event: MouseEvent) => {
        event.stopPropagation();
        await deleteCharacter(row.id);
    }


    return (
        <div>
            {/* Header with Icon Button */}
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        Character List
                    </Typography>
                    <IconButton
                        color="inherit"
                        onClick={() => navigate("/create-character")}
                    >
                        <AddIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Table Displaying Characters */}
            <TableContainer component={Paper} style={{ marginTop: "20px" }}>
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
                            <TableRow className='body-row' key={character.id} onClick={() => handleRowClick(character)}>
                                <TableCell>{character.classes.map(characterClass => (<Icon className='class-icon' path={classIcons[characterClass.name]}></Icon>))}</TableCell>
                                <TableCell>{character.name} </TableCell>
                                <TableCell>{character.classes.map(characterClass => characterClass.name).join(', ')}</TableCell>
                                <TableCell>{<IconButton onClick={(e) => handleDeleteClick(character, e as unknown as MouseEvent)}><DeleteIcon/></IconButton>}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};