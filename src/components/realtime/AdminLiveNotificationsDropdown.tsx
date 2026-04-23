'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type AdminLiveNotification = {
  id: string
  userId?: string | null
  type: string
  title: string
  message: string
  metadata?: Record<string, unknown>
  createdAt: string
  read?: boolean
}

const STORAGE_KEY = 'admin-live-notifications'
const EVENT_NAME = 'admin-live-notifications-updated'

function loadNotifications(): AdminLiveNotification[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as AdminLiveNotification[]

    
return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveNotifications(items: AdminLiveNotification[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(EVENT_NAME))
}

function formatTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Just now'
  
return date.toLocaleString()
}

export default function AdminLiveNotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AdminLiveNotification[]>([])
  const anchorRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const sync = () => setItems(loadNotifications())

    sync()
    window.addEventListener(EVENT_NAME, sync)

    
return () => {
      window.removeEventListener(EVENT_NAME, sync)
    }
  }, [])

  const unreadCount = useMemo(() => items.filter((x) => !x.read).length, [items])

  const markAllRead = () => {
    const next = items.map((x) => ({ ...x, read: true }))

    setItems(next)
    saveNotifications(next)
  }

  const markRead = (id: string) => {
    const next = items.map((x) => (x.id === id ? { ...x, read: true } : x))

    setItems(next)
    saveNotifications(next)
  }

  const clearAll = () => {
    setItems([])
    saveNotifications([])
  }

  return (
    <>
      <IconButton ref={anchorRef} onClick={() => setOpen((prev) => !prev)} className='text-textPrimary'>
        <Badge
          color='error'
          className='cursor-pointer'
          variant='dot'
          overlap='circular'
          invisible={unreadCount === 0}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <i className='ri-notification-2-line' />
        </Badge>
      </IconButton>
      <Popper open={open} anchorEl={anchorRef.current} placement='bottom-end' className='z-[1300] mt-2 w-[380px]'>
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Paper elevation={8} className='max-h-[560px] overflow-hidden'>
            <Box className='px-4 py-3 flex items-center justify-between'>
              <Typography variant='h6'>Admin notifications</Typography>
              <Typography variant='caption' color='text.secondary'>
                {unreadCount} unread
              </Typography>
            </Box>
            <Divider />
            <List className='max-h-[420px] overflow-y-auto'>
              {items.length === 0 ? (
                <ListItem>
                  <ListItemText primary='No live notifications yet.' secondary='Order and payment events will appear here.' />
                </ListItem>
              ) : (
                items.map((item) => (
                  <ListItem
                    key={item.id}
                    onClick={() => markRead(item.id)}
                    className={`cursor-pointer border-b border-[var(--mui-palette-divider)] ${item.read ? 'opacity-70' : ''}`}
                  >
                    <ListItemText
                      primary={item.title}
                      secondary={
                        <Stack spacing={0.5}>
                          <Typography variant='body2' component='span'>
                            {item.message}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' component='span'>
                            {formatTime(item.createdAt)}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
            <Divider />
            <Box className='px-4 py-3'>
              <Stack direction='row' spacing={1}>
                <Button fullWidth size='small' variant='contained' onClick={markAllRead}>
                  Mark all read
                </Button>
                <Button fullWidth size='small' variant='outlined' color='inherit' onClick={clearAll}>
                  Clear
                </Button>
              </Stack>
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  )
}
