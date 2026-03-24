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

import { useAddMovement, useAdminInventory, useAdminMovements, useUpdateInventory } from '@/api/admin/inventory'

const InventoryManagement = () => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  const [openMove, setOpenMove] = useState(false)
  const [movementJson, setMovementJson] = useState('{"variantId":"","locationId":"","type":"PURCHASE","quantity":1}')

  const params = useMemo(() => ({ page: page + 1, pageSize, ...(search.trim() ? { search: { all: search.trim() } } : {}) }), [page, pageSize, search])
  const { data } = useAdminInventory(params)
  const { data: movementData } = useAdminMovements({ page: 1, pageSize: 5 })
  const addMovement = useAddMovement()
  const updateInventory = useUpdateInventory()

  const rows = data?.data ?? []
  const total = data?.pagination.total ?? 0

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}><Typography variant='h4'>Inventory Management</Typography></Grid>
      <Grid size={{ xs: 12 }}>
        <Card><CardContent>
          <div className='flex justify-between mb-4'>
            <TextField size='small' placeholder='Search...' value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
            <Button variant='contained' onClick={() => setOpenMove(true)}>Add Movement</Button>
          </div>
          <Table size='small'>
            <TableHead><TableRow><TableCell>Product</TableCell><TableCell>SKU</TableCell><TableCell>Location</TableCell><TableCell>Qty</TableCell><TableCell align='right'>Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.variant?.product?.name || '—'}</TableCell>
                  <TableCell>{r.variant?.sku || '—'}</TableCell>
                  <TableCell>{r.location?.name || r.locationId}</TableCell>
                  <TableCell>{r.quantity}</TableCell>
                  <TableCell align='right'>
                    <Button size='small' onClick={() => updateInventory.mutate({ variantId: r.variantId, payload: { locationId: r.locationId, quantity: r.quantity + 1 } })}>+1</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination component='div' count={total} page={page} rowsPerPage={pageSize} onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={e => { setPageSize(Number(e.target.value)); setPage(0) }} />

          <Typography variant='h6' className='mt-6 mb-2'>Recent Movements</Typography>
          <Table size='small'>
            <TableHead><TableRow><TableCell>Type</TableCell><TableCell>Qty</TableCell><TableCell>Variant</TableCell><TableCell>Created</TableCell></TableRow></TableHead>
            <TableBody>{(movementData?.data || []).map(m => <TableRow key={m.id}><TableCell>{m.type}</TableCell><TableCell>{m.quantity}</TableCell><TableCell>{m.variantId}</TableCell><TableCell>{new Date(m.createdAt).toLocaleString()}</TableCell></TableRow>)}</TableBody>
          </Table>
        </CardContent></Card>
      </Grid>

      <Dialog open={openMove} onClose={() => setOpenMove(false)} fullWidth maxWidth='md'>
        <DialogTitle>Add Inventory Movement</DialogTitle>
        <DialogContent><TextField fullWidth multiline minRows={8} value={movementJson} onChange={e => setMovementJson(e.target.value)} /></DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMove(false)}>Cancel</Button>
          <Button variant='contained' onClick={async () => { await addMovement.mutateAsync(JSON.parse(movementJson)); setOpenMove(false) }}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default InventoryManagement
