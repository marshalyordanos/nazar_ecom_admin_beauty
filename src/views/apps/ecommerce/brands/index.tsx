'use client'

import { useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { useAdminBrands, useCreateBrand, useDeleteBrand, useUpdateBrand } from '@/api/admin/brands'
import type { Brand } from '@/types/brand'

const BrandsManagement = () => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)

  const params = useMemo(() => ({ page: page + 1, pageSize, ...(search.trim() ? { search: { all: search.trim() } } : {}) }), [page, pageSize, search])

  const { data, isLoading, isError, refetch } = useAdminBrands(params)
  const createMut = useCreateBrand()
  const updateMut = useUpdateBrand()
  const deleteMut = useDeleteBrand()

  const rows = data?.data ?? []
  const total = data?.pagination.total ?? 0

  const submit = async () => {
    const fd = new FormData()

    fd.append('name', name)
    fd.append('slug', slug)
    if (description) fd.append('description', description)
    if (image) fd.append('image', image)
    if (editing) await updateMut.mutateAsync({ id: editing.id, formData: fd })
    else await createMut.mutateAsync(fd)
    setOpen(false)
    setEditing(null)
    setName('')
    setSlug('')
    setDescription('')
    setImage(null)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Brand Management</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <div className='flex gap-3 items-center justify-between mb-4'>
              <TextField size='small' placeholder='Search...' value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
              <Button variant='contained' onClick={() => setOpen(true)}>Add Brand</Button>
            </div>
            {isError ? <Alert severity='error' action={<Button onClick={() => refetch()}>Retry</Button>}>Failed to load brands</Alert> : null}
            {isLoading ? <Skeleton variant='rounded' height={260} /> : (
              <>
                <Table size='small'>
                  <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Slug</TableCell><TableCell>Description</TableCell><TableCell align='right'>Actions</TableCell></TableRow></TableHead>
                  <TableBody>
                    {rows.map(row => (
                      <TableRow key={row.id}>
                        <TableCell>{row.name}</TableCell><TableCell>{row.slug}</TableCell><TableCell>{row.description || '—'}</TableCell>
                        <TableCell align='right'>
                          <Button size='small' onClick={() => { setEditing(row); setName(row.name); setSlug(row.slug || ''); setDescription(row.description || ''); setOpen(true) }}>Edit</Button>
                          <Button size='small' color='error' onClick={() => deleteMut.mutate(row.id)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination component='div' count={total} page={page} rowsPerPage={pageSize} onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={e => { setPageSize(Number(e.target.value)); setPage(0) }} />
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>{editing ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pt-4'>
          <TextField label='Name' value={name} onChange={e => setName(e.target.value)} />
          <TextField label='Slug' value={slug} onChange={e => setSlug(e.target.value)} />
          <TextField label='Description' multiline minRows={3} value={description} onChange={e => setDescription(e.target.value)} />
          <Button component='label' variant='outlined'>{image ? image.name : 'Upload Logo'}<input hidden type='file' accept='image/*' onChange={e => setImage(e.target.files?.[0] ?? null)} /></Button>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant='contained' onClick={submit} disabled={!name || !slug || (!editing && !image)}>Save</Button></DialogActions>
      </Dialog>
    </Grid>
  )
}

export default BrandsManagement
