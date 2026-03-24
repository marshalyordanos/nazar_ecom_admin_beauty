'use client'

// React Imports
import { useEffect, useState } from 'react'
import type { SyntheticEvent, ChangeEvent } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

// Components Imports
import CustomIconButton from '@core/components/mui/IconButton'
import { useOptions } from '@/api/options/useOptions'
import type { ProductOption, OptionValue } from '@/types/option'
import { useFormContext } from 'react-hook-form'

interface VariantRow {
  optionId: string | null
  valueId: string | null
}

const ProductVariants = ({ optionValue, isUpdate=false }: { optionValue: any, isUpdate: boolean }) => {
  console.log("optionValue ----------",optionValue)
  const { register , setValue} = useFormContext()

  const [rows, setRows] = useState<VariantRow[]>([
    { optionId: null, valueId: null }
  ])

  const { data: options } = useOptions()

  console.log("rows ----------",rows)

  // ✅ Populate rows when editing
  useEffect(() => {
    if (isUpdate && Array.isArray(optionValue) && optionValue.length) {
      const mappedRows: VariantRow[] = optionValue.map((item: any) => ({
        optionId: item?.optionValue?.optionId || null,
        valueId: item?.optionValueId || null
      }))

      setRows(mappedRows)
    }
  }, [isUpdate, optionValue])

  const getSelectedOptionIds = (excludeIndex: number): string[] => {
    return rows
      .filter((row, idx) => idx !== excludeIndex && row.optionId)
      .map(row => row.optionId as string)
  }

  const handleOptionChange = (index: number, e: ChangeEvent<{ value: unknown }>) => {
    const optionId = e.target.value as string
    setRows(prev => {
      const newRows = [...prev]
      newRows[index] = { optionId, valueId: null }
      return newRows
    })
  }

  const handleValueChange = (index: number, e: ChangeEvent<{ value: unknown }>) => {
    const valueId = e.target.value as string
    setRows(prev => {
      const newRows = [...prev]
      newRows[index] = { ...newRows[index], valueId }
      return newRows
    })
    console.log("valueId 222; ",valueId)
  }

  useEffect(()=>{
    setValue(`optionValueIds`, [...rows.map(row => row.valueId as string)])
  },[rows])

  const deleteForm = (e: SyntheticEvent, index: number) => {
    e.preventDefault()
    setRows(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== index))
  }

  const addRow = () => {
    setRows(prev => [...prev, { optionId: null, valueId: null }])
  }

  return (
    <Card>
      <CardHeader title='Variants' />
      <CardContent>
        <Grid container spacing={6}>
          {rows.map((row, index) => {
            const optionList: ProductOption[] = Array.isArray(options) ? options : []

            const selectedOption = row.optionId
              ? optionList.find(opt => opt.id === row.optionId)
              : undefined

            const selectedOptionIds = getSelectedOptionIds(index)

            return (
              <Grid key={index} size={{ xs: 12 }} className='repeater-item'>
                <Grid container spacing={6}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>Select Variant</InputLabel>
                      <Select
                        label='Select Variant'
                        value={row.optionId || ''}
                        onChange={e => handleOptionChange(index, e as any)}
                      >
                        {optionList.map(option => (
                          <MenuItem
                            key={option.id}
                            value={option.id}
                            disabled={selectedOptionIds.includes(option.id)}
                          >
                            {option.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 8 }}>
                    <div className='flex items-center gap-6'>
                      <FormControl fullWidth>
                        <InputLabel>Variant Value</InputLabel>
                        <Select
                          label='Variant Value'
                          value={row.valueId || ''}
                          onChange={e => handleValueChange(index, e as any)}
                          disabled={!row.optionId}
                        >
                          {selectedOption && Array.isArray(selectedOption.values) && selectedOption.values.length
                            ? selectedOption.values.map((val: OptionValue) => (
                                <MenuItem key={val.id} value={val.id}>
                                  {val.value}
                                </MenuItem>
                              ))
                            : <MenuItem value="" disabled>No Values Available</MenuItem>
                          }
                        </Select>
                      </FormControl>

                      <CustomIconButton
                        onClick={e => deleteForm(e, index)}
                        className='min-is-fit'
                        disabled={rows.length === 1}
                      >
                        <i className='ri-close-line' />
                      </CustomIconButton>
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            )
          })}

          <Grid size={{ xs: 12 }}>
            <Button
              variant='contained'
              onClick={addRow}
              startIcon={<i className='ri-add-line' />}
            >
              Add Another Option
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ProductVariants