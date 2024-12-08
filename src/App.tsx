import React from 'react';
import './App.css';
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import {CharacterTable} from "./characters/character-table/characterTable";
import {CreateCharacter} from "./characters/createCharacter";
import {CharacterSpellLists} from "./characters/character-spell-lists/characterSpellLists";


function App() {
  return (
      <div className="App App-header">
        <Router basename="/spell_list">
          <Routes>
            <Route path="/" element={<CharacterTable/>}/>
            <Route path="/create-character" element={<CreateCharacter/>}/>
            <Route path="/character/:id" element={<CharacterSpellLists/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
