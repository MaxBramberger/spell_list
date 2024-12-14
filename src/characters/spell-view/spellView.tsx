import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Spell } from '../../db/Types';
import { getSpellList$ } from '../../service/SpellListService';
import { AppBar, IconButton, Paper, Toolbar, Typography } from '@mui/material';
import Icon from '@mdi/react';
import { mdiChevronLeft } from '@mdi/js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
export const SpellView = () => {
  const [spell, setSpell] = useState<Spell>();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const spellIndex = params.index;

    const spellListSubscription = getSpellList$().subscribe((spells) => {
      const foundSpell = spells.find(
        (currentSpell) => currentSpell.index === spellIndex
      );

      if (foundSpell) {
        setSpell(foundSpell);
      }
    });
    return () => spellListSubscription.unsubscribe();
  }, [params.index]);

  const handleBackwardsClick = () => {
    const charId = searchParams.get('charId');
    if (charId) {
      navigate(`/character/${charId}`);
    } else {
      navigate(`/`);
    }
  };

  return (
    <div className="page-container">
      <AppBar position="static">
        <Toolbar className="tool-bar">
          <IconButton color="inherit" onClick={() => handleBackwardsClick()}>
            <Icon path={mdiChevronLeft} size={1}></Icon>
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            {spell ? spell.name : ''}
          </Typography>
        </Toolbar>
      </AppBar>
      {spell && (
        <Paper>
          <div>
            <p>
              <strong>Classes: </strong> {spell.classes.join(', ')}
            </p>
            <p>
              <strong>Components: </strong> {spell.components.join(', ')}
            </p>
            {spell.material && (
              <p>
                {' '}
                <strong>Material: </strong>
                {spell.material}
              </p>
            )}
            {spell.desc.map((descriptionBlock, index) => (
              <ReactMarkdown remarkPlugins={[remarkGfm]} key={index}>
                {descriptionBlock}
              </ReactMarkdown>
            ))}
          </div>
        </Paper>
      )}
    </div>
  );
};
