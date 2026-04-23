'use client'

import { useEffect } from 'react'

import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'

import { dashboardKeys } from '@/api/admin/dashboard'
import { decodeAccessToken, getAccessTokenFromCookies, getStoredAuthUser } from '@/libs/backendAuth'
import { getSocketBaseUrl } from '@/libs/api'

type NotificationPayload = {
  id: string
  userId?: string | null
  type: string
  title: string
  message: string
  metadata?: Record<string, unknown>
  createdAt: string
}

const ADMIN_NOTIFICATION_STORAGE_KEY = 'admin-live-notifications'
const ADMIN_NOTIFICATION_EVENT = 'admin-live-notifications-updated'

function readSession() {
  const token = getAccessTokenFromCookies()
  const user = getStoredAuthUser()
  const decoded = token ? decodeAccessToken(token) : null
  const userId = user?.id ?? decoded?.userId ?? null

  return { token, userId }
}

function storeIncomingNotification(payload: NotificationPayload) {
  if (typeof window === 'undefined') return
  const raw = window.localStorage.getItem(ADMIN_NOTIFICATION_STORAGE_KEY)
  const list = raw ? (JSON.parse(raw) as Array<NotificationPayload & { read?: boolean }>) : []
  const next = [{ ...payload, read: false }, ...list.filter((item) => item.id !== payload.id)].slice(0, 50)

  window.localStorage.setItem(ADMIN_NOTIFICATION_STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(ADMIN_NOTIFICATION_EVENT))
}

export default function AdminNotificationSocketBridge() {
  const qc = useQueryClient()

  useEffect(() => {
    const { token, userId } = readSession()
    const socketBase = getSocketBaseUrl()

    if (!token || !socketBase) return

    const socket = io(socketBase, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket'],
    })

    const onNotification = (payload: NotificationPayload) => {
      if (payload.userId && userId && payload.userId !== userId) {
        return
      }

      storeIncomingNotification(payload)
      qc.invalidateQueries({ queryKey: dashboardKeys.notificationSummary })
      qc.invalidateQueries({ queryKey: dashboardKeys.notificationsUnread })
    }

    socket.on('notification', onNotification)

    return () => {
      socket.off('notification', onNotification)
      socket.disconnect()
    }
  }, [qc])

  return null
}
