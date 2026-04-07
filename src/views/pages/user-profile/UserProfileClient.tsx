'use client'

import { useCallback, useEffect, useState } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

import CustomTabList from '@core/components/mui/TabList'
import { api } from '@/libs/api'

type MeUser = {
  id: string
  email: string
  phone?: string | null
  firstName?: string | null
  lastName?: string | null
}

const UserProfileClient = () => {
  const [tab, setTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [me, setMe] = useState<MeUser | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const { data } = await api.get<MeUser>('/users/me')
      setMe(data)
      setFirstName(data.firstName ?? '')
      setLastName(data.lastName ?? '')
      setPhone(data.phone ?? '')
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as Error).message) : 'Failed to load profile'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const saveProfile = async () => {
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      const { data } = await api.patch<MeUser>('/users/me', {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined
      })
      setMe(data)
      setSuccess('Profile updated.')
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { message?: string } } }
      setError(ax.response?.data?.message ?? 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const savePassword = async () => {
    setError(null)
    setSuccess(null)
    setPwSaving(true)
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      })
      setCurrentPassword('')
      setNewPassword('')
      setSuccess('Password updated.')
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { message?: string } } }
      setError(ax.response?.data?.message ?? 'Password change failed')
    } finally {
      setPwSaving(false)
    }
  }

  if (loading && !me) {
    return (
      <Grid container spacing={6} justifyContent='center' className='p-6'>
        <CircularProgress />
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Account</Typography>
        <Typography variant='body2' color='text.secondary' className='mt-1'>
          Update your profile and password.
        </Typography>
      </Grid>

      {error && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='error' onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}
      {success && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='success' onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Grid>
      )}

      <Grid size={{ xs: 12 }}>
        <TabContext value={tab}>
          <CustomTabList
            onChange={(_, v) => setTab(v)}
            variant='scrollable'
            pill='true'
          >
            <Tab
              value='profile'
              label={
                <span className='flex items-center gap-2'>
                  <i className='ri-user-3-line text-lg' />
                  Profile
                </span>
              }
            />
            <Tab
              value='security'
              label={
                <span className='flex items-center gap-2'>
                  <i className='ri-lock-password-line text-lg' />
                  Security
                </span>
              }
            />
          </CustomTabList>

          <TabPanel value='profile' className='p-0 pbs-6'>
            <Card>
              <CardContent className='flex flex-col gap-4'>
                <TextField label='Email' value={me?.email ?? ''} disabled fullWidth />
                <TextField
                  label='First name'
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  fullWidth
                />
                <TextField
                  label='Last name'
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  fullWidth
                />
                <TextField label='Phone' value={phone} onChange={e => setPhone(e.target.value)} fullWidth />
                <Button variant='contained' onClick={() => void saveProfile()} disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value='security' className='p-0 pbs-6'>
            <Card>
              <CardContent className='flex flex-col gap-4 max-is-md'>
                <TextField
                  type='password'
                  label='Current password'
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  fullWidth
                  autoComplete='current-password'
                />
                <TextField
                  type='password'
                  label='New password'
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  fullWidth
                  autoComplete='new-password'
                />
                <Button variant='contained' onClick={() => void savePassword()} disabled={pwSaving}>
                  {pwSaving ? 'Updating…' : 'Change password'}
                </Button>
              </CardContent>
            </Card>
          </TabPanel>
        </TabContext>
      </Grid>
    </Grid>
  )
}

export default UserProfileClient
