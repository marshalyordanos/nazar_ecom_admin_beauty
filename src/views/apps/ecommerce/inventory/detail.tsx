'use client'

import { useMemo, useState } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import tableStyles from '@core/styles/table.module.css'
import { useAdminMovements } from '@/api/admin/inventory'
import { useParams } from 'next/navigation'
// Assuming this is your new inventory movement hook from @inventory.ts

const InventoryMovements = () => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const idParams = useParams()
  const id = idParams.detail as string

  const params = useMemo(
    () => ({
      filter: {
        inventoryId: id
      },
      page: page + 1,
      pageSize,
      ...(search.trim() ? { search: { all: search.trim() } } : {})
    }),
    [id,page, pageSize, search]
  )

  const { data, isLoading, isFetching } = useAdminMovements(params)
  const rows = data?.data ?? []
  const total = data?.pagination.total ?? 0

  return (
    <>
      <Card>
        <CardHeader title='Inventory Movement List' />
        <Divider />
        <CardContent>
          <div className="flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 mb-5">
            <TextField
              size="small"
              placeholder="Search Inventory Movements"
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPage(0)
              }}
              style={{ maxWidth: 300 }}
            />
          </div>
          <div className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Location</th>
                </tr>
              </thead>
              {(isLoading || isFetching) ? (
                <tbody>
                  <tr>
                    <td className="text-center" colSpan={6}>Loading...</td>
                  </tr>
                </tbody>
              ) : rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td className="text-center" colSpan={6}>No data available</td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id}>
                      <td>
                        <Typography>
                          {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                        </Typography>
                      </td>
                      <td>
                        <div className='flex flex-col gap-0.5'>
                          <Typography className='font-medium'>
                            {r.variant?.product?.name || '—'}
                          </Typography>
                        </div>
                      </td>
                      <td>
                        <Typography>{r.variant?.sku || '—'}</Typography>
                      </td>
                      <td>
                        <Typography>{r.type || '—'}</Typography>
                      </td>
                      <td>
                        <Typography>{r.quantity}</Typography>
                      </td>
                      <td>
                        <Typography>{r.location?.name || r.locationId || '—'}</Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component='div'
            className='border-bs'
            count={total}
            rowsPerPage={pageSize}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={e => {
              setPageSize(Number(e.target.value))
              setPage(0)
            }}
          />
        </CardContent>
      </Card>
    </>
  )
}

export default InventoryMovements
