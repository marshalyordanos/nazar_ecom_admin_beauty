'use client'

import { useState, useMemo, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'

import { useBrands } from '@/api/brands/useBrands'
import { useCategories } from '@/api/categories/useCategories'

// Import types
import type { Brand } from '@/types/brand'
import type { Category } from '@/types/category'
import { useFormContext } from 'react-hook-form'

const ProductOrganize = () => {
  const { register, setValue, watch } = useFormContext()
  
  // Watch for brandId, categoryId, brandName, and categoryName from form
  const brandId = watch('brandId')
  const brandName = watch('brandName')
  const categoryId = watch('categoryId')
  const categoryName = watch('categoryName')
  const productStatus = watch('status')

  // State for controlling the selection components
  const [brand, setBrand] = useState<Brand | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [categorySearch, setCategorySearch] = useState<string>('')
  const [brandSearch, setBrandSearch] = useState<string>('')
  const [status, setStatus] = useState<string>(productStatus || '')

  // Query brands and categories, only send search in params if value present
  const {
    data: brandsData,
    isLoading: brandsLoading
  } = useBrands(
    useMemo(
      () => ({
        page: 1,
        pageSize: 25,
        ...(brandSearch ? { search: { name: brandSearch } } : {})
      }),
      [brandSearch]
    )
  )

  const {
    data: categoriesData,
    isLoading: categoriesLoading
  } = useCategories(
    useMemo(
      () => ({
        page: 1,
        pageSize: 25,
        ...(categorySearch ? { search: { name: categorySearch } } : {})
      }),
      [categorySearch]
    )
  )

  // Set brand from form when editing a product (populating)
  useEffect(() => {
    if (brandsData?.data && brandId) {
      // Try to find exact Brand object by id
      const match = brandsData.data.find((b: Brand) => b.id === brandId)
      if (match) {
        setBrand(match)
      } else if (brandName) {
        setBrand({ id: brandId, name: brandName, slug: '' }) // fallback with name if available
      }
    } else if (brandId && brandName) {
      setBrand({ id: brandId, name: brandName, slug: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId, brandName, brandsData?.data])

  // Set category from form when editing a product (populating)
  useEffect(() => {
    if (categoriesData?.data && categoryId) {
      const match = categoriesData.data.find((c: Category) => c.id === categoryId)
      if (match) {
        setCategory(match)
      } else if (categoryName) {
        setCategory({ id: categoryId, name: categoryName, slug: '', image: '', track: '' })
      }
    } else if (categoryId && categoryName) {
      setCategory({ id: categoryId, name: categoryName, slug: '', image: '', track: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, categoryName, categoriesData?.data])

  // Keep status field in sync if it changes elsewhere
  useEffect(() => {
    setStatus(productStatus || '')
  }, [productStatus])

  return (
    <Card>
      <CardHeader title="Organize" />
      <CardContent>
        <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-5">

          {/* Brand Autocomplete */}
          <Autocomplete
            value={brand}
            onChange={(_, newValue) => {
              setBrand(newValue)
              setValue('brandId', newValue?.id ?? '')
            }}
            inputValue={brandSearch}
            onInputChange={(_, newInputValue) => setBrandSearch(newInputValue)}
            options={brandsData?.data ?? (brand ? [brand] : [])}
            getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            loading={brandsLoading}
            filterOptions={x => x} // Do not filter client side; use backend.
            renderInput={params => (
              <TextField
                {...params}
                label="Select Brand"
                placeholder="Search brand..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {brandsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />

          {/* Category Autocomplete */}
          <Autocomplete
            value={category}
            onChange={(_, newValue) => {
              setCategory(newValue)
              setValue('categoryId', newValue?.id ?? '')
              setValue('categoryName', newValue?.name ?? '')
            }}
            inputValue={categorySearch}
            onInputChange={(_, newInputValue) => setCategorySearch(newInputValue)}
            options={categoriesData?.data ?? (category ? [category] : [])}
            getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            loading={categoriesLoading}
            filterOptions={x => x} // Do not filter client side; use backend.
            renderInput={params => (
              <TextField
                {...params}
                label="Select Category"
                placeholder="Search category..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {categoriesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />

          {/* Status Select */}
          <FormControl fullWidth>
            <InputLabel>Select Status</InputLabel>
            <Select
              {...register('status')}
              label="Select Status"
              value={status}
              onChange={e => {
                setStatus(e.target.value)
                setValue('status', e.target.value)
              }}
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="DRAFT">Draft</MenuItem>
              <MenuItem value="ARCHIVED">Archived</MenuItem>
            </Select>
          </FormControl>
        </form>
      </CardContent>
    </Card>
  )
}

export default ProductOrganize
