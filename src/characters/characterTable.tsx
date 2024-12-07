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
import {deleteCharacter, fetchCharacters, getCharacters$} from "../service/CharacterService";
import {Character} from "../db/Types";

export const CharacterTable: React.FC = () => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const navigate = useNavigate();

    fetchCharacters();

    useEffect(() => {
        const subscription = getCharacters$().subscribe(setCharacters); // Subscribe to the counter observable

        return () => subscription.unsubscribe(); // Cleanup subscription on unmount
    }, []);


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
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Delete</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {characters.map((character) => (
                            <TableRow key={character.id}>
                                <TableCell>{character.id}</TableCell>
                                <TableCell>{character.name}</TableCell>
                                <TableCell>{<IconButton onClick={() => deleteCharacter(character.id)}><DeleteIcon/></IconButton>}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};