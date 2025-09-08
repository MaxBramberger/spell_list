import Button from '@mui/material/Button';

export interface ToggleButtonInput {
  text: string;
  toggled: boolean;
  callback: () => void;
}

export default function ToggleButton(param: ToggleButtonInput) {
  return (
    <Button
      size="small"
      variant="outlined"
      color="primary"
      onClick={(e) => {
        param.callback();
        e.stopPropagation();
      }}
      sx={{
        textTransform: 'none',
        fontSize: '0.75rem', // smaller text
        padding: '2px 8px', // tighter padding (vertical | horizontal)
        minWidth: 'unset', // prevents default min width
        borderRadius: '6px', // tweak shape if you want
        ...(param.toggled && {
          backgroundColor: (theme) => theme.palette.primary.main,
          color: (theme) => theme.palette.primary.contrastText,
        }),
        ...(!param.toggled && {
          borderColor: (theme) => theme.palette.primary.main,
          color: (theme) => theme.palette.primary.main,
        }),
      }}
    >
      {param.toggled ? `${param.text}` : `${param.text}`}
    </Button>
  );
}
