'use client'

// MUI Imports
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export type AppRouteLoadingVariant = 'full' | 'embedded'

type AppRouteLoadingProps = {
  variant?: AppRouteLoadingVariant
}

const AppRouteLoading = ({ variant = 'embedded' }: AppRouteLoadingProps) => {
  const full = variant === 'full'

  if (full) {
    return (
      <Box
        className='flex w-full flex-col items-center justify-center p-6'
        sx={{ minBlockSize: 'min(85dvb, 720px)' }}
      >
        <Stack spacing={3} alignItems='center' sx={{ width: '100%', maxWidth: 420 }}>
          <LinearProgress sx={{ width: '100%', borderRadius: 999 }} />
          <CircularProgress size={40} thickness={4} />
          <Typography color='text.secondary' variant='body2'>
            Loading…
          </Typography>
        </Stack>
      </Box>
    )
  }

  return (
    <Box className='flex w-full flex-col gap-6 p-6' sx={{ minBlockSize: 'min(65dvb, 560px)' }}>
      <Box className='flex items-center gap-3'>
        <CircularProgress size={28} thickness={4} />
        <Typography color='text.secondary' variant='body2'>
          Loading…
        </Typography>
      </Box>
      <Stack spacing={2}>
        <Skeleton variant='rounded' height={140} animation={false} sx={{ borderRadius: 2 }} />
        <Skeleton variant='rounded' height={96} animation={false} sx={{ borderRadius: 2 }} />
        <Skeleton variant='rounded' height={96} animation={false} sx={{ borderRadius: 2 }} />
      </Stack>
    </Box>
  )
}

export default AppRouteLoading
