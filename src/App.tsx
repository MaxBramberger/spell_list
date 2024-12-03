import React, {JSX, useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import {getSpellList$, Spell} from "./SpellListService";
import {SRDImporter} from "./SRDImporter";


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

function App() {
  const [spells, setSpells] = useState<Spell[]>([]);

  useEffect(() => {
    const subscription = getSpellList$().subscribe(setSpells); // Subscribe to the counter observable

    return () => subscription.unsubscribe(); // Cleanup subscription on unmount
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo"/>
        <SRDImporter/>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <ul>
          {spells.map(spell => (<SpellEntry {...spell} />))}
        </ul>
      </header>
    </div>
  );
}

export default App;
