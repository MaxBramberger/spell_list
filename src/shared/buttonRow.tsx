import React from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';

type ButtonRowProps = {
  icon: React.ReactNode;
  label: string;
  color?: string;
  justifyContent?: string;
  //eslint-disable-next-line
  onClick?: (x: any) => void;
};

const ButtonRow: React.FC<ButtonRowProps> = ({
  icon,
  label,
  color,
  justifyContent,
  onClick,
}) => {
  return (
    <ButtonBase
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: justifyContent ? justifyContent : 'flex-start',
        p: 1.5,
        borderRadius: 1,
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        color: color ?? '',
      }}
      onClick={onClick}
    >
      <Box sx={{ mr: 2, height: 27 }}>{icon}</Box>
      <Typography sx={{ height: 27 }} variant="body1">
        {label}
      </Typography>
    </ButtonBase>
  );
};

export default ButtonRow;
