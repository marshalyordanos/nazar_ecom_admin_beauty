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
import CircularProgress from '@mui/material/CircularProgress'

import { useAdminReviews, useDeleteReview, useUpdateReview } from '@/api/admin/reviews'
import MutationBlockingOverlay from '@/components/loading/MutationBlockingOverlay'
import type { ReviewAdmin } from '@/api/admin/types'

const ReviewsManagement = () => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const params = useMemo(() => ({ page: page + 1, pageSize, ...(search.trim() ? { search: { all: search.trim() } } : {}) }), [page, pageSize, search])

  const { data } = useAdminReviews(params)
  const updateMut = useUpdateReview()
  const deleteMut = useDeleteReview()

  const [edit, setEdit] = useState<ReviewAdmin | null>(null)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')

  const rows = data?.data ?? []
  const total = data?.pagination.total ?? 0
  const reviewBusy = updateMut.isPending || deleteMut.isPending

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}><Typography variant='h4'>Review Management</Typography></Grid>
      <Grid size={{ xs: 12 }}>
        <Card sx={{ position: 'relative', overflow: 'hidden' }}>
          <MutationBlockingOverlay open={reviewBusy && !edit} message='Updating reviews…' />
          <CardContent>
          <TextField
            size='small'
            placeholder='Search reviews...'
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(0)
            }}
            className='mb-4'
            disabled={reviewBusy}
          />
          <Table size='small'>
            <TableHead><TableRow><TableCell>Product</TableCell><TableCell>User</TableCell><TableCell>Rating</TableCell><TableCell>Title</TableCell><TableCell align='right'>Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.product?.name || r.productId}</TableCell>
                  <TableCell>{r.user?.email || r.userId}</TableCell>
                  <TableCell>{r.rating}</TableCell>
                  <TableCell>{r.title || '—'}</TableCell>
                  <TableCell align='right'>
                    <Button
                      size='small'
                      disabled={reviewBusy}
                      onClick={() => {
                        setEdit(r)
                        setRating(r.rating)
                        setTitle(r.title || '')
                        setComment(r.comment || '')
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size='small'
                      color='error'
                      disabled={reviewBusy}
                      onClick={() => deleteMut.mutate(r.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination component='div' count={total} page={page} rowsPerPage={pageSize} onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={e => { setPageSize(Number(e.target.value)); setPage(0) }} />
        </CardContent>
        </Card>
      </Grid>

      <Dialog
        open={Boolean(edit)}
        onClose={() => !updateMut.isPending && setEdit(null)}
        fullWidth
        maxWidth='sm'
        slotProps={{ paper: { sx: { position: 'relative', overflow: 'hidden' } } }}
      >
        <MutationBlockingOverlay open={updateMut.isPending} message='Saving review…' />
        <DialogTitle>Edit Review</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pt-4'>
          <TextField
            type='number'
            label='Rating'
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
            disabled={updateMut.isPending}
          />
          <TextField label='Title' value={title} onChange={e => setTitle(e.target.value)} disabled={updateMut.isPending} />
          <TextField
            label='Comment'
            multiline
            minRows={4}
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={updateMut.isPending}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEdit(null)} disabled={updateMut.isPending}>
            Cancel
          </Button>
          <Button
            variant='contained'
            disabled={updateMut.isPending}
            startIcon={updateMut.isPending ? <CircularProgress color='inherit' size={18} /> : undefined}
            onClick={async () => {
              if (!edit) return
              await updateMut.mutateAsync({ id: edit.id, payload: { rating, title, comment } })
              setEdit(null)
            }}
          >
            {updateMut.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default ReviewsManagement
