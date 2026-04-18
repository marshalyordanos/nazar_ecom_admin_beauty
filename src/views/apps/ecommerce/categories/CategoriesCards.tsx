'use client'

import { useCallback, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'

import CategoryFormDrawer from '@/views/apps/ecommerce/products/category/CategoryFormDrawer'
import MutationBlockingOverlay from '@/components/loading/MutationBlockingOverlay'
import {
  excludedParentIdsForEdit,
  flattenCategoryTreeForSelect
} from '@/views/apps/ecommerce/products/category/categoryFormUtils'
import { useCategoriesTree, useDeleteCategory } from '@/api/categories/useCategories'

import type { CategoryTreeNode } from '@/types/category'

function formatMoney(n: number, currency = 'USD') {
  return n.toLocaleString(undefined, { style: 'currency', currency, maximumFractionDigits: 0 })
}

function TreeRow({
  node,
  depth,
  onAddChild,
  onEdit,
  onDelete,
  actionsDisabled
}: {
  node: CategoryTreeNode
  depth: number
  onAddChild: (parentId: string) => void
  onEdit: (n: CategoryTreeNode) => void
  onDelete: (n: CategoryTreeNode) => void
  actionsDisabled?: boolean
}) {
  return (
    <>
      <ListItem
        sx={{ pl: theme => theme.spacing(2 + depth * 2), py: 1 }}
        secondaryAction={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size='small'
              aria-label='Add subcategory'
              disabled={actionsDisabled}
              onClick={() => onAddChild(node.id)}
            >
              <i className='ri-add-line' />
            </IconButton>
            <IconButton size='small' aria-label='Edit' disabled={actionsDisabled} onClick={() => onEdit(node)}>
              <i className='ri-edit-line' />
            </IconButton>
            <IconButton
              size='small'
              aria-label='Delete'
              color='error'
              disabled={actionsDisabled}
              onClick={() => onDelete(node)}
            >
              <i className='ri-delete-bin-line' />
            </IconButton>
          </Box>
        }
      >
        <ListItemText
          primary={node.name}
          secondary={
            <Typography component='span' variant='caption' color='text.secondary'>
              {node.slug}
              {node.totalProducts != null ? ` · ${node.totalProducts} products` : null}
            </Typography>
          }
        />
      </ListItem>
      {node.children?.map(ch => (
        <TreeRow
          key={ch.id}
          node={ch}
          depth={depth + 1}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onDelete={onDelete}
          actionsDisabled={actionsDisabled}
        />
      ))}
    </>
  )
}

const CategoriesCards = () => {
  const { data: roots = [], isLoading, isError, refetch } = useCategoriesTree()
  const deleteMut = useDeleteCategory()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add')
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null)
  const [editing, setEditing] = useState<CategoryTreeNode | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<CategoryTreeNode | null>(null)

  const parentOptions = useMemo(() => {
    const skip = editing ? excludedParentIdsForEdit(roots, editing.id) : undefined
    const flat = flattenCategoryTreeForSelect(roots, 0, skip)

    
return flat
  }, [roots, editing])

  const openAddRoot = useCallback(() => {
    setDrawerMode('add')
    setDefaultParentId(null)
    setEditing(null)
    setDrawerOpen(true)
  }, [])

  const openAddChild = useCallback((parentId: string) => {
    setDrawerMode('add')
    setDefaultParentId(parentId)
    setEditing(null)
    setDrawerOpen(true)
  }, [])

  const openEdit = useCallback((n: CategoryTreeNode) => {
    setDrawerMode('edit')
    setEditing(n)
    setDefaultParentId(null)
    setDrawerOpen(true)
  }, [])

  const openDelete = useCallback((n: CategoryTreeNode) => setDeleteTarget(n), [])

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false)
    setEditing(null)
    setDefaultParentId(null)
  }, [])

  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      await deleteMut.mutateAsync(deleteTarget.id)
    } finally {
      setDeleteTarget(null)
    }
  }

  if (isLoading) {
    return (
      <Grid container spacing={4}>
        {[1, 2, 3].map(i => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
            <Skeleton variant='rounded' height={280} />
          </Grid>
        ))}
      </Grid>
    )
  }

  if (isError) {
    return (
      <Card variant='outlined'>
        <CardContent>
          <Typography color='error' className='mbe-2'>
            Could not load categories.
          </Typography>
          <Button variant='contained' onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <MutationBlockingOverlay open={deleteMut.isPending} message='Deleting category…' />
      <Box className='flex flex-wrap items-center justify-between gap-4 mbe-6'>
        <div>
          <Typography variant='h5' className='mbe-1'>
            Category tree
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Roots are shown as cards; nested categories are listed inside. Sales stats include all descendants.
          </Typography>
        </div>
        <Button
          variant='contained'
          startIcon={<i className='ri-add-line' />}
          onClick={openAddRoot}
          disabled={deleteMut.isPending}
        >
          Add root category
        </Button>
      </Box>

      {roots.length === 0 ? (
        <Card variant='outlined'>
          <CardContent className='text-center py-10'>
            <Typography color='text.secondary' className='mbe-3'>
              No categories yet.
            </Typography>
            <Button variant='contained' onClick={openAddRoot}>
              Create your first category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={4}>
          {roots.map(root => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={root.id}>
              <Card className='bs-full flex flex-col overflow-hidden border border-divider shadow-sm'>
                <Box className='relative h-40 bg-actionHover'>
                  {root.image ? (
                    <img src={root.image} alt='' className='size-full object-cover' />
                  ) : (
                    <div className='flex size-full items-center justify-center text-textSecondary'>
                      <i className='ri-folder-image-line text-5xl' />
                    </div>
                  )}
                  <Box className='absolute top-2 end-2 flex gap-1'>
                    <IconButton
                      size='small'
                      sx={{ bgcolor: 'background.paper' }}
                      onClick={() => openAddChild(root.id)}
                      aria-label='Add subcategory'
                      disabled={deleteMut.isPending}
                    >
                      <i className='ri-add-line' />
                    </IconButton>
                    <IconButton
                      size='small'
                      sx={{ bgcolor: 'background.paper' }}
                      onClick={() => openEdit(root)}
                      aria-label='Edit'
                      disabled={deleteMut.isPending}
                    >
                      <i className='ri-edit-line' />
                    </IconButton>
                    <IconButton
                      size='small'
                      sx={{ bgcolor: 'background.paper' }}
                      color='error'
                      onClick={() => openDelete(root)}
                      aria-label='Delete'
                      disabled={deleteMut.isPending}
                    >
                      <i className='ri-delete-bin-line' />
                    </IconButton>
                  </Box>
                </Box>
                <CardContent className='flex-1 flex flex-col gap-3'>
                  <div>
                    <Typography variant='h6' className='leading-tight'>
                      {root.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' className='line-clamp-2'>
                      {root.description || 'No description'}
                    </Typography>
                  </div>
                  <Box className='flex flex-wrap gap-1'>
                    <Chip size='small' label={`${root.totalProducts} products`} variant='outlined' />
                    <Chip size='small' label={`${root.totalProductsSold} sold`} variant='outlined' />
                    <Chip size='small' label={formatMoney(root.totalSalesAmount)} variant='outlined' />
                  </Box>
                  {root.children && root.children.length > 0 ? (
                    <>
                      <Divider />
                      <Typography variant='subtitle2' color='text.secondary'>
                        Subcategories
                      </Typography>
                      <List dense disablePadding className='max-bs-56 overflow-y-auto'>
                        {root.children?.map(ch => (
                          <TreeRow
                            key={ch.id}
                            node={ch}
                            depth={0}
                            onAddChild={openAddChild}
                            onEdit={openEdit}
                            onDelete={openDelete}
                            actionsDisabled={deleteMut.isPending}
                          />
                        ))}
                      </List>
                    </>
                  ) : (
                    <Typography variant='caption' color='text.secondary'>
                      No subcategories
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <CategoryFormDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        mode={drawerMode}
        defaultParentId={defaultParentId}
        category={
          editing
            ? {
                id: editing.id,
                name: editing.name,
                slug: editing.slug,
                description: editing.description,
                parentId: editing.parentId,
                image: editing.image
              }
            : null
        }
        parentOptions={parentOptions}
      />

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete category?</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            {deleteTarget
              ? `This will remove “${deleteTarget.name}”. Subcategories or products may block deletion.`
              : null}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleteMut.isPending}>
            Cancel
          </Button>
          <Button color='error' variant='contained' onClick={confirmDelete} disabled={deleteMut.isPending}>
            {deleteMut.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CategoriesCards
