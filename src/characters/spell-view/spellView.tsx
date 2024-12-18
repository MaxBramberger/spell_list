import React, { useEffect, useState } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { Spell } from '../../db/Types';
import { getSpellList$ } from '../../service/SpellListService';
import { AppBar, IconButton, Paper, Toolbar, Typography } from '@mui/material';
import Icon from '@mdi/react';
import { mdiChevronLeft } from '@mdi/js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './spellView.css';
import '../../App.css';

export const SpellView = () => {
  const [spell, setSpell] = useState<Spell>();
  const location = useLocation();
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
    const activeTab = searchParams.get('activeTab');

    if (charId) {
      const baseUrl = `/character/${charId}`;

      // Add query parameters conditionally
      let queryString = '';
      if (activeTab) queryString += `?activeTab=${activeTab}`;
      if (spell)
        queryString += `${queryString ? '&' : '?'}spellIndex=${spell.index}`;
      navigate(`${baseUrl}${queryString}`, { ...location });
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
      <div className="page-content">
        {spell && (
          <Paper className="view">
            <div>
              <p className="level-and-school">
                {spell.level > 0
                  ? `${spell.level} level ${spell.school}`
                  : `${spell.school} cantrip`}{' '}
                {spell.ritual && '(ritual)'}
              </p>
              <p>
                <strong>Casting Time:</strong> {spell.casting_time}
              </p>
              <p>
                <strong>Range: </strong> {spell.range}
              </p>
              <p>
                <strong>Components: </strong> {spell.components.join(', ')}
              </p>
              {spell.material && (
                <p>
                  <strong>Material: </strong>
                  {spell.material}
                </p>
              )}
              <p>
                <strong>Duration: </strong>{' '}
                {spell.concentration && 'Concentration,'} {spell.duration}
              </p>
              <p>
                <strong>Classes: </strong> {spell.classes.join(', ')}
              </p>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {spell.desc
                  .map((descBlock) =>
                    descBlock[0] === '|' &&
                    descBlock[descBlock.length - 1] === '|'
                      ? `${descBlock}`
                      : `\n${descBlock}`
                  )
                  .join('\n')}
              </ReactMarkdown>
              {spell.higher_level && spell.higher_level.length > 0 && (
                <p>
                  <strong> At Higher Levels:</strong> {spell.higher_level}
                </p>
              )}
            </div>
          </Paper>
        )}
      </div>
    </div>
  );
};
