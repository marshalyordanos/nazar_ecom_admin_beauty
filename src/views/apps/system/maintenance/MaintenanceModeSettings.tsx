'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import CircularProgress from '@mui/material/CircularProgress'
import { api } from '@/libs/api'
import { toast } from 'react-toastify'

type Row = {
  webMaintenance: boolean
  adminMaintenance: boolean
  mobileMaintenance: boolean
}

export default function MaintenanceModeSettings() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery<Row>({
    queryKey: ['maintenance-config'],
    queryFn: async () => (await api.get('/maintenance')).data
  })

  const [web, setWeb] = useState(false)
  const [admin, setAdmin] = useState(false)
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    if (!data) return
    setWeb(data.webMaintenance)
    setAdmin(data.adminMaintenance)
    setMobile(data.mobileMaintenance)
  }, [data])

  const mut = useMutation({
    mutationFn: async () =>
      (
        await api.patch('/maintenance', {
          webMaintenance: web,
          adminMaintenance: admin,
          mobileMaintenance: mobile
        })
      ).data as Row,
    onSuccess: (row) => {
      toast.success('Maintenance settings saved')
      qc.setQueryData(['maintenance-config'], row)
      qc.invalidateQueries({ queryKey: ['maintenance-config'] })
    },
    onError: () => toast.error('Could not save. Check permissions (settings · update).')
  })

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h5' sx={{ px: { xs: 4, md: 0 } }} gutterBottom>
          Maintenance mode
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ px: { xs: 4, md: 0 }, mb: 2 }}>
          Single global row: when toggled on, that surface shows a maintenance state. Uses one database row —
          saves always update it.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 8, lg: 6 }}>
        <Card>
          <CardHeader title='Per-app switches' />
          <CardContent>
            {isLoading || !data ? (
              <CircularProgress />
            ) : (
              <>
                <FormControlLabel
                  control={<Switch checked={web} onChange={(_, v) => setWeb(v)} />}
                  label={
                    <>
                      <strong>Public web storefront</strong>
                      <Typography variant='caption' display='block' color='text.secondary'>
                        Visitors see a maintenance screen instead of the shop.
                      </Typography>
                    </>
                  }
                  sx={{ alignItems: 'flex-start', mb: 3, display: 'flex' }}
                />
                <FormControlLabel
                  control={<Switch checked={admin} onChange={(_, v) => setAdmin(v)} />}
                  label={
                    <>
                      <strong>Admin panel</strong>
                      <Typography variant='caption' display='block' color='text.secondary'>
                        Blocks dashboard routes except this page — so staff can restore access.
                      </Typography>
                    </>
                  }
                  sx={{ alignItems: 'flex-start', mb: 3, display: 'flex' }}
                />
                <FormControlLabel
                  control={<Switch checked={mobile} onChange={(_, v) => setMobile(v)} />}
                  label={
                    <>
                      <strong>Mobile app</strong>
                      <Typography variant='caption' display='block' color='text.secondary'>
                        Stored for the Expo app — call{' '}
                        <code>{`GET /api/v1/maintenance`}</code> and honor{' '}
                        <code>mobileMaintenance</code>.
                      </Typography>
                    </>
                  }
                  sx={{ alignItems: 'flex-start', mb: 4, display: 'flex' }}
                />
                <Button
                  variant='contained'
                  onClick={() => mut.mutate()}
                  disabled={mut.isPending}
                  startIcon={mut.isPending ? <CircularProgress size={18} color='inherit' /> : undefined}
                >
                  Save changes
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
