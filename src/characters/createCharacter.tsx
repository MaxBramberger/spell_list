import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    TextField,
    Container,
} from "@mui/material";
import {addCharacter} from "../service/CharacterService";

export const CreateCharacter: React.FC = () => {
    const navigate = useNavigate();

    // State to store the character name
    const [characterName, setCharacterName] = useState<string>("");

    const handleCreateCharacter = async () => {
        if (characterName.trim()) {
            await addCharacter({
                class: '',
                name: characterName,
                lists: []
            })
            setCharacterName("");
        } else {
            alert("Please enter a valid character name.");
        }
    };

    return (
        <div>
            {/* Header */}
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        Create a Character
                    </Typography>
                    <Button color="inherit" onClick={() => navigate("/")}>
                        Back
                    </Button>
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
                <Button
                    variant="contained"
                    color="primary"
                    style={{ marginTop: "10px" }}
                    onClick={handleCreateCharacter}
                >
                    Create Character
                </Button>
            </Container>
        </div>
    );
};