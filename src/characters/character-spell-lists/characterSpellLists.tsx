import {useParams} from "react-router-dom";
import {getCharacter} from "../../service/CharacterService";
import { useNavigate } from "react-router-dom";
import {AppBar, IconButton, Toolbar, Typography} from "@mui/material";
import React, {useState} from "react";
import Icon from "@mdi/react";
import {mdiChevronLeft} from "@mdi/js";
import {Character, classIcons} from "../../db/Types";
import './characterSpellLists.css'

export function CharacterSpellLists () {
    const [character, setCharacter] = useState<Character>();


    const params = useParams()
    const navigate = useNavigate();

    const charId = parseInt(params.id ? params.id : '');
    getCharacter(charId).then(character => setCharacter(character));

    return (
        <div>
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
   </div>)
}