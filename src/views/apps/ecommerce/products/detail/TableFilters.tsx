
// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Button from '@mui/material/Button'

// API + Types
import { useCategories } from '@/api/categories/useCategories'
import type { ProductType } from '@/types/apps/ecommerceTypes'
import { Category } from '@/types/category'
import { useProducts } from '@/api/products/useProducts'
import { Product } from '@/types/products'

type ProductStockType = { [key: string]: boolean }

const productStockObj: ProductStockType = {
  'In Stock': true,
  'Out of Stock': false
}

const TableFilters = ({
  setData,
  productData
}: {
  setData: (data: Product[]) => void
  productData?: Product[]
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [stock, setStock] = useState('')
  const [status, setStatus] = useState<ProductType['status']>('')

  console.log("selectedCategories", selectedCategories)
  const { data: categoriesResponse = [] } = useCategories({ tree: true })

  // ✅ Get children based on path
  const getChildren = (categories: Category[] = [], path: string[]) => {
    let list = categories

    for (let id of path) {
      const found = list.find((cat) => cat.id === id)
      if (!found?.children?.length) return []
      list = found.children
    }

    return list
  }
  const selectedTrack = selectedCategories[selectedCategories.length - 1] || ''


  const {data:productsResponse} = useProducts({
    page: 1,
    pageSize: 10,
    track: selectedTrack,
    filter: {
      status: status
    }
  })
  // ✅ FILTER PRODUCTS
  useEffect(() => {
   
  
    setData(productsResponse?.data ?? [])
  }, [productsResponse, setData])

  // ✅ CLEAR
  const handleClearFilters = () => {
    setSelectedCategories([])
    setStock('')
    setStatus('')
    setData(productData ?? [])
  }

  // ✅ FIXED RENDER LOGIC (NO while loop)
  const renderCategorySelects = () => {
    const selects = []

    // total levels = selected + next level
    const totalLevels = selectedCategories.length + 1

    for (let level = 0; level < totalLevels; level++) {
      const path = selectedCategories.slice(0, level)

      const options =
        level === 0
          ? categoriesResponse
          : getChildren(categoriesResponse, path)

      if (!options.length) break

      const value = selectedCategories[level] || ''

      selects.push(
        <Grid size={{ xs: 12, sm: 4 }} key={level}>
          <FormControl fullWidth>
            <InputLabel>Category Level {level + 1}</InputLabel>

            <Select
              value={value}
              label={`Category Level ${level + 1}`}
              onChange={(e) => {
                const newValue = e.target.value as string

                let next = [...selectedCategories]

                if (!newValue) {
                  next = next.slice(0, level)
                } else {
                  next = [...selectedCategories.slice(0, level), newValue]
                }

                setSelectedCategories(next)
              }}
            >
              <MenuItem value=''>Select Category</MenuItem>

              {options.map((c: Category) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )
    }

    return selects
  }

  return (
    <CardContent>
      <Grid container spacing={6} alignItems="center">
        {/* STATUS */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value=''>Select Status</MenuItem>
              <MenuItem value='ACTIVE'>Active</MenuItem>
              <MenuItem value='DRAFT'>Draft</MenuItem>
              <MenuItem value='ARCHIVED'>Archived</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* CATEGORY */}
        {renderCategorySelects()}

        {/* STOCK */}
        {/* <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel>Stock</InputLabel>
            <Select
              value={stock}
              label="Stock"
              onChange={(e) => setStock(e.target.value as string)}
            >
              <MenuItem value=''>Select Stock</MenuItem>
              <MenuItem value='In Stock'>In Stock</MenuItem>
              <MenuItem value='Out of Stock'>Out of Stock</MenuItem>
            </Select>
          </FormControl>
        </Grid> */}

        {/* CLEAR */}
        <Grid size={{ xs: 12 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters

