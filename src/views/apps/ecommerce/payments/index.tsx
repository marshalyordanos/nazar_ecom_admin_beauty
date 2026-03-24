'use client'

import { useMemo, useState } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { useAdminPayments, useCapturePayment, useRefundPayment } from '@/api/admin/payments'

const PaymentsManagement = () => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const params = useMemo(() => ({ page: page + 1, pageSize, ...(search.trim() ? { search: { all: search.trim() } } : {}) }), [page, pageSize, search])

  const { data } = useAdminPayments(params)
  const captureMut = useCapturePayment()
  const refundMut = useRefundPayment()

  const rows = data?.data ?? []
  const total = data?.pagination.total ?? 0

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}><Typography variant='h4'>Payment Management</Typography></Grid>
      <Grid size={{ xs: 12 }}>
        <Card><CardContent>
          <div className='flex justify-between mb-4'><TextField size='small' placeholder='Search...' value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} /></div>
          <Table size='small'>
            <TableHead><TableRow><TableCell>Provider</TableCell><TableCell>Status</TableCell><TableCell>Order</TableCell><TableCell>Amount</TableCell><TableCell align='right'>Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.provider}</TableCell><TableCell>{r.status}</TableCell><TableCell>{r.order?.orderNumber || r.orderId}</TableCell><TableCell>{r.amount} {r.currency}</TableCell>
                  <TableCell align='right'>
                    <Button size='small' onClick={() => captureMut.mutate(r.id)} disabled={r.status !== 'PENDING'}>Capture</Button>
                    <Button size='small' color='warning' onClick={() => refundMut.mutate(r.id)} disabled={r.status !== 'PAID'}>Refund</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination component='div' count={total} page={page} rowsPerPage={pageSize} onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={e => { setPageSize(Number(e.target.value)); setPage(0) }} />
        </CardContent></Card>
      </Grid>
    </Grid>
  )
}

export default PaymentsManagement
