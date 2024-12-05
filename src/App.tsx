import React, {JSX, useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import {fetchSpells, getSpellList$} from "./service/SpellListService";
import {SRDImporter} from "./SRDImporter";
import {Spell} from "./db/Db";
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import {CharacterTable} from "./characters/characterTable";
import {CreateCharacter} from "./characters/createCharacter";


function SpellEntry(spell: Spell) : JSX.Element{
  const [expanded, setExpanded] = useState<boolean>(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  }

  return (
      <div>{spell.name} <button onClick={toggleExpanded}> {expanded ? 'collapse' : 'expand'}</button>
        {expanded && (
          <ul>
            {<li> {spell.desc.map(desc => <p>{desc}</p>)}</li>}
          </ul>
        )}
      </div>
  );
}

function LandingPage(){
  const [spells, setSpells] = useState<Spell[]>([]);

  useEffect(() => {
    const subscription = getSpellList$().subscribe(setSpells); // Subscribe to the counter observable

    return () => subscription.unsubscribe(); // Cleanup subscription on unmount
  }, []);

  fetchSpells().then();
  return (
      <div className="App">
        <img src={logo} className="App-logo" alt="logo"/>
        <SRDImporter/>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <ul>
          {spells.map(spell => (<SpellEntry {...spell} />))}
        </ul>
      </div>
  )
}

function CharacterSelect(){

}

function App() {
  return (
      <div className="App App-header">
        <Router>
          <Routes>
            <Route path="/" element={<CharacterTable/>}/>
            <Route path="/create-character" element={<CreateCharacter/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
