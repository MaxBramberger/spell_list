import React from 'react';
import './App.css';
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import {CharacterTable} from "./characters/characterTable";
import {CreateCharacter} from "./characters/createCharacter";


function App() {
  return (
      <div className="App App-header">
        <Router basename="/spell_list">
          <Routes>
            <Route path="/" element={<CharacterTable/>}/>
            <Route path="/create-character" element={<CreateCharacter/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
