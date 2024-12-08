import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    IconButton
} from "@mui/material";
import {addCharacter} from "../service/CharacterService";
import {CharacterClass, charClassDict} from "../db/Types";
import Icon from "@mdi/react";
import {mdiChevronLeft} from "@mdi/js";

export const CreateCharacter: React.FC = () => {
    const navigate = useNavigate();

    // State to store the character name
    const [characterName, setCharacterName] = useState<string >("");

    // State to store the selected character class
    const [characterClass, setCharacterClass] = useState<CharacterClass | null>(null);

    const classes = Object.values(charClassDict);

    const handleCreateCharacter = async () => {
        if (characterName.trim() && characterClass) {
            await addCharacter({
                class: characterClass,
                name: characterName,
                lists: []
            });
            setCharacterName("");
            setCharacterClass(null);
            navigate("/");
        } else {
            alert("Please enter a valid character name and select a class.");
        }
    };

    return (
        <div>
            {/* Header */}
            <AppBar position="static">
                <Toolbar>
                    <IconButton color="inherit" onClick={() => navigate("/")}>
                        <Icon path={mdiChevronLeft} size={1}></Icon>
                    </IconButton>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        Create a Character
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Form */}
            <Container style={{ marginTop: "20px" }}>
                <TextField
                    fullWidth
                    label="Character Name"
                    variant="outlined"
                    margin="normal"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="character-class-label">Character Class</InputLabel>
                    <Select
                        labelId="character-class-label"
                        value={characterClass}
                        onChange={(e) => setCharacterClass(e.target.value as CharacterClass)}
                        variant="outlined"
                    >
                        { classes.map(charClass =>
                            (<MenuItem value={charClass}> {charClass}</MenuItem>)
                        )}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    color="primary"
                    style={{ marginTop: "10px" }}
                    disabled={!characterClass || !characterName.trim()}
                    onClick={handleCreateCharacter}
                >
                    Create Character
                </Button>
            </Container>
        </div>
    );
};