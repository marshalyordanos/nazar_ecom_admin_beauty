'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

export default function DashboardMaintenanceGate({
  locale,
  children
}: {
  locale: string
  children: ReactNode
}) {
  const pathname = usePathname()
  const onControlPage = pathname?.includes('/apps/system/maintenance') ?? false

  const [loading, setLoading] = useState(true)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    let cancel = false
    const base = process.env.NEXT_PUBLIC_API_URL || ''

    ;(async () => {
      if (onControlPage) {
        if (!cancel) {
          setBlocked(false)
          setLoading(false)
        }
        return
      }

      try {
        const { data } = await axios.get<{ adminMaintenance?: boolean }>(`${base}/maintenance`)
        if (!cancel && data?.adminMaintenance === true) {
          setBlocked(true)
        } else if (!cancel) {
          setBlocked(false)
        }
      } catch {
        if (!cancel) setBlocked(false)
      } finally {
        if (!cancel) setLoading(false)
      }
    })()

    return () => {
      cancel = true
    }
  }, [onControlPage, pathname])

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='50vh'>
        <CircularProgress size={36} />
      </Box>
    )
  }

  if (blocked) {
    const settingsUrl = `/${locale}/apps/system/maintenance`
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          bgcolor: 'action.hover'
        }}
      >
        <Typography variant='h5' fontWeight={700} gutterBottom>
          Admin maintenance
        </Typography>
        <Typography color='text.secondary' sx={{ maxWidth: 440, textAlign: 'center', mb: 3 }}>
          The admin panel is in maintenance mode. Open the controls page (settings permission required) to
          turn modes off for each app.
        </Typography>
        <Button component={Link} href={settingsUrl} variant='contained'>
          Maintenance controls
        </Button>
      </Box>
    )
  }

  return <>{children}</>
}
