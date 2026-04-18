'use client'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

type Props = {
  open: boolean
  message?: string
}

export default function MutationBlockingOverlay({ open, message = 'Please wait…' }: Props) {
  if (!open) return null

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: theme => theme.zIndex.modal - 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        bgcolor: theme =>
          theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(3px)',
        borderRadius: 'inherit'
      }}
    >
      <CircularProgress size={36} />
      <Typography variant='body2' color='text.secondary'>
        {message}
      </Typography>
    </Box>
  )
}
