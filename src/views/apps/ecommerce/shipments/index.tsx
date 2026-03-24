'use client'

import { useMemo, useState } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { useAdminShipments, useTrackShipment, useUpdateShipment } from '@/api/admin/shipments'

const ShipmentsManagement = () => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [targetId, setTargetId] = useState<string | null>(null)

  const params = useMemo(() => ({ page: page + 1, pageSize, ...(search.trim() ? { search: { all: search.trim() } } : {}) }), [page, pageSize, search])
  const { data } = useAdminShipments(params)
  const trackMut = useTrackShipment()
  const updateMut = useUpdateShipment()

  const rows = data?.data ?? []
  const total = data?.pagination.total ?? 0

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}><Typography variant='h4'>Shipment Management</Typography></Grid>
      <Grid size={{ xs: 12 }}>
        <Card><CardContent>
          <div className='flex justify-between mb-4'><TextField size='small' placeholder='Search...' value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} /></div>
          <Table size='small'>
            <TableHead><TableRow><TableCell>Order</TableCell><TableCell>Tracking</TableCell><TableCell>Status</TableCell><TableCell>Carrier</TableCell><TableCell align='right'>Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.order?.orderNumber || r.orderId}</TableCell>
                  <TableCell>{r.trackingNumber || '—'}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>{r.carrier || '—'}</TableCell>
                  <TableCell align='right'>
                    <Button size='small' onClick={() => trackMut.mutate(r.id)}>Track</Button>
                    <Button size='small' onClick={() => setTargetId(r.id)}>Update Status</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination component='div' count={total} page={page} rowsPerPage={pageSize} onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={e => { setPageSize(Number(e.target.value)); setPage(0) }} />
        </CardContent></Card>
      </Grid>

      <Dialog open={Boolean(targetId)} onClose={() => setTargetId(null)}>
        <DialogTitle>Update Shipment Status</DialogTitle>
        <DialogContent><TextField label='Status' value={status} onChange={e => setStatus(e.target.value)} /></DialogContent>
        <DialogActions>
          <Button onClick={() => setTargetId(null)}>Cancel</Button>
          <Button variant='contained' onClick={async () => { if (!targetId) return; await updateMut.mutateAsync({ id: targetId, payload: { status } }); setTargetId(null); setStatus('') }}>Update</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default ShipmentsManagement
