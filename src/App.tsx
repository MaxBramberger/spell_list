import React from 'react';
import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { CharacterTable } from './characters/character-table/characterTable';
import { CreateCharacter } from './characters/createCharacter';
import { CharacterSpellLists } from './characters/character-spell-lists/characterSpellLists';
import { SpellView } from './characters/spell-view/spellView';
import { ThemeModeProvider } from './context/theme.context';

function App() {
  return (
    <ThemeModeProvider>
      <div className="App App-header">
        <Router basename="/spell_list">
          <Routes>
            <Route path="/" element={<CharacterTable />} />
            <Route path="/create-character" element={<CreateCharacter />} />
            <Route path="/character/:id" element={<CharacterSpellLists />} />
            <Route path="/spell/:index" element={<SpellView />} />
          </Routes>
        </Router>
      </div>
    </ThemeModeProvider>
  );
}

export default App;
