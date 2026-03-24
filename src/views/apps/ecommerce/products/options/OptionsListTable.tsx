'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { api } from '@/libs/api'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import type { TextFieldProps } from '@mui/material/TextField'
import { useRouter } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { useOptions } from '@/api/options/useOptions'
import AddOptionDrawer from './AddOptionDrawer'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type OptionValue = {
  id: string
  value: string
  optionId: string
  createdAt: string
}

type OptionType = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  values: OptionValue[]
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

// Column Definitions
const columnHelper = createColumnHelper<OptionType>()

const OptionsListTable = () => {
  // States
  const [addOptionOpen, setAddOptionOpen] = useState(false)
const [optionId, setOptionId] = useState<string | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const router = useRouter()

  const { data: options, isLoading: isLoadingOptions, error: errorOptions, refetch } = useOptions()

  useEffect(() => {
    if (!addOptionOpen) {   // <-- only refetch when it changes to false
      refetch();
    }
  }, [addOptionOpen, refetch]);
  // Filtering logic for options
  const filteredOptions: OptionType[] = useMemo(() => {
    if (!options) return []
    if (!globalFilter) return options
    return options.filter(opt =>
      opt.name.toLowerCase().includes(globalFilter.trim().toLowerCase())
    )
  }, [options, globalFilter])

  // For delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Hooks
  const { lang: locale } = useParams() as { lang: string }

  // Handler to confirm delete
  const handleDeleteOption = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.delete(`/products/options/${deleteId}`)
      setDeleteDialogOpen(false)
      setDeleteId(null)
      refetch && refetch()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const columns = useMemo<ColumnDef<OptionType, any>[]>(
    () => [
      {
        id: 'name',
        header: 'Option Name',
        accessorFn: row => row.name,
        cell: ({ row }) => (
          <Typography className='font-medium'>{row.original.name}</Typography>
        )
      },
      {
        id: 'values',
        header: 'Values',
        accessorFn: row => row.values?.map(v => v.value).join(', '),
        cell: ({ row }) => (
          <div className='flex gap-2 flex-wrap'>
            {row.original.values && row.original.values.length > 0
              ? row.original.values.map(val => (
                  <span
                    key={val.id}
                    style={{
                      background: '#F4F5F7',
                      color: '#555',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: 13
                    }}
                  >
                    {val.value}
                  </span>
                ))
              : <span style={{ color: '#bbb' }}>No values</span>}
          </div>
        )
      },
      {
        id: 'createdAt',
        header: 'Created At',
        accessorFn: row => row.createdAt,
        cell: ({ row }) => (
          <Typography>
            {new Date(row.original.createdAt).toLocaleString()}
          </Typography>
        )
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton
              size='small'
              onClick={() =>
                  {
                    setOptionId(row.original.id)
                    setAddOptionOpen(true)
                  }
              }
              aria-label="Edit Option"
            >
              <i className='ri-edit-box-line text-[22px] text-textSecondary' />
            </IconButton>
            <IconButton
              size='small'
              color='error'
              onClick={() => {
                setDeleteId(row.original.id)
                setDeleteDialogOpen(true)
              }}
              aria-label="Delete Option"
            >
              <i className='ri-delete-bin-7-line text-[22px] text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      }
    ],
    [router, locale]
  )

  const table = useReactTable({
    data: filteredOptions,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection
    },
    enableRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  return (
    <>
      <Card>
        <CardHeader title='Product Options' />
        <Divider />
        <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 p-5'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Option'
            className='max-sm:is-full'
          />
          <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
          <Button variant='contained' onClick={() =>{
            setOptionId(null)
            setAddOptionOpen(!addOptionOpen)}} className='max-sm:is-full'>

              Add Option    
            </Button>
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            className={classnames({
                              'flex items-center': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <i className='ri-arrow-up-s-line text-xl' />,
                              desc: <i className='ri-arrow-down-s-line text-xl' />
                            }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                          </div>
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {isLoadingOptions ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    Loading...
                  </td>
                </tr>
              </tbody>
            ) : table.getRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No options available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </Card>
      <AddOptionDrawer
        open={addOptionOpen}
        handleClose={() => setAddOptionOpen(!addOptionOpen)}
        optionData={options}
        optionId={optionId ?? undefined}
        // setData={setAddOptionOpen}
        setData={()=>{}}
      />
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Option</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this option? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDeleteOption} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default OptionsListTable
