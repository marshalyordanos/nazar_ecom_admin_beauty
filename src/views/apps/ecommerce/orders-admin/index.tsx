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

import { useAdminOrders, useCompleteOrder, useCreateAdminOrder } from '@/api/admin/orders'

const OrdersAdminManagement = () => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  const [openCreate, setOpenCreate] = useState(false)
  const [payload, setPayload] = useState('{\n  "shopId": "",\n  "userId": "",\n  "subtotal": 0,\n  "grandTotal": 0,\n  "currency": "USD",\n  "items": [],\n  "address": {\n    "name": "",\n    "phone": "",\n    "addressLine1": "",\n    "city": "",\n    "country": ""\n  }\n}')

  const params = useMemo(() => ({ page: page + 1, pageSize, ...(search.trim() ? { search: { all: search.trim() } } : {}) }), [page, pageSize, search])
  const { data } = useAdminOrders(params)
  const completeMut = useCompleteOrder()
  const createMut = useCreateAdminOrder()

  const rows = data?.data ?? []
  const total = data?.pagination.total ?? 0

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}><Typography variant='h4'>Order Management</Typography></Grid>
      <Grid size={{ xs: 12 }}>
        <Card><CardContent>
          <div className='flex gap-3 items-center justify-between mb-4'>
            <TextField size='small' placeholder='Search order number...' value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
            <Button variant='contained' onClick={() => setOpenCreate(true)}>Create Admin Order</Button>
          </div>
          <Table size='small'>
            <TableHead><TableRow><TableCell>Order</TableCell><TableCell>Status</TableCell><TableCell>User</TableCell><TableCell>Total</TableCell><TableCell align='right'>Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.orderNumber}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.user?.email || row.userId}</TableCell>
                  <TableCell>{row.grandTotal} {row.currency}</TableCell>
                  <TableCell align='right'>
                    <Button size='small' onClick={() => completeMut.mutate(row.id)} disabled={completeMut.isPending || row.status === 'COMPLETED'}>Complete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination component='div' count={total} page={page} rowsPerPage={pageSize} onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={e => { setPageSize(Number(e.target.value)); setPage(0) }} />
        </CardContent></Card>
      </Grid>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth='md'>
        <DialogTitle>Create Order (Admin)</DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline minRows={14} value={payload} onChange={e => setPayload(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant='contained' onClick={async () => { await createMut.mutateAsync(JSON.parse(payload)); setOpenCreate(false) }}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default OrdersAdminManagement
