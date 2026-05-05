'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

type Props = {
  children: ReactNode
  /** Shown when collapsed, e.g. " · 2 active" */
  summaryHint?: string
}

/**
 * Below `md`, wraps children behind a single expand/collapse control.
 * From `md` up, children are always visible (no toggle).
 */
export default function CollapsibleFiltersSection({ children, summaryHint }: Props) {
  const theme = useTheme()
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(false)

  if (!isMdDown) {
    return <Box>{children}</Box>
  }

  return (
    <Box className='flex flex-col gap-2'>
      <Button
        variant='outlined'
        color='secondary'
        size='medium'
        fullWidth
        onClick={() => setOpen(v => !v)}
        startIcon={<i className={open ? 'ri-arrow-up-s-line' : 'ri-equalizer-line'} />}
        sx={{
          justifyContent: 'flex-start',
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 48,
          borderStyle: 'solid'
        }}
      >
        {open ? 'Hide filters' : 'Show filters'}
        {summaryHint ? (
          <Box component='span' sx={{ ml: 0.75, opacity: 0.75, fontWeight: 400, fontSize: '0.875rem' }}>
            {summaryHint}
          </Box>
        ) : null}
      </Button>
      <Collapse in={open} timeout='auto'>
        <Box className='flex flex-col gap-3 pt-0.5'>{children}</Box>
      </Collapse>
    </Box>
  )
}
