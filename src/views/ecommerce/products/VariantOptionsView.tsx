'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import {
  useCreateOptionValue,
  useCreateVariantOption,
  useDeleteOptionValue,
  useDeleteVariantOption,
  useVariantOptions
} from '@/hooks/ecommerce/useEcommerceProducts'

import EcommerceProductsNav from './EcommerceProductsNav'

export default function VariantOptionsView() {
  const { data: options, isLoading, isError, error } = useVariantOptions()
  const createOpt = useCreateVariantOption()
  const delOpt = useDeleteVariantOption()

  const [newOptionName, setNewOptionName] = useState('')
  const [valueInputs, setValueInputs] = useState<Record<string, string>>({})

  if (!process.env.NEXT_PUBLIC_API_URL) {
    return <Alert severity='error'>Set NEXT_PUBLIC_API_URL</Alert>
  }

  return (
    <Box>
      <Typography variant='h4' className='mbe-2'>
        Variant options & values
      </Typography>
      <EcommerceProductsNav />

      <Card className='mbe-4'>
        <CardContent className='flex flex-wrap gap-2 items-end'>
          <TextField
            size='small'
            label='New option (e.g. Size)'
            value={newOptionName}
            onChange={e => setNewOptionName(e.target.value)}
            sx={{ minWidth: 240 }}
          />
          <Button
            variant='contained'
            disabled={!newOptionName.trim() || createOpt.isPending}
            onClick={async () => {
              await createOpt.mutateAsync({ name: newOptionName.trim() })
              setNewOptionName('')
            }}
          >
            Add option
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <CircularProgress />
      ) : isError ? (
        <Alert severity='error'>{(error as Error)?.message}</Alert>
      ) : (
        <Box className='flex flex-col gap-4'>
          {(options ?? []).map(opt => (
            <OptionCard
              key={opt.id}
              optionId={opt.id}
              name={opt.name}
              values={opt.values ?? []}
              valueDraft={valueInputs[opt.id] ?? ''}
              onDraftChange={v => setValueInputs(s => ({ ...s, [opt.id]: v }))}
              onDeleteOption={() => {
                if (!confirm(`Delete option "${opt.name}"?`)) return
                delOpt.mutate(opt.id)
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

function OptionCard({
  optionId,
  name,
  values,
  valueDraft,
  onDraftChange,
  onDeleteOption
}: {
  optionId: string
  name: string
  values: { id: string; value: string }[]
  valueDraft: string
  onDraftChange: (v: string) => void
  onDeleteOption: () => void
}) {
  const addVal = useCreateOptionValue(optionId)
  const delVal = useDeleteOptionValue(optionId)

  return (
    <Card>
      <CardContent>
        <Box className='flex justify-between items-center mbe-2'>
          <Typography variant='h6'>{name}</Typography>
          <Button size='small' color='error' onClick={onDeleteOption}>
            Delete option
          </Button>
        </Box>
        <ul className='list-none p-0 m-0 flex flex-col gap-1'>
          {values.map(v => (
            <li key={v.id} className='flex items-center gap-2'>
              <Typography variant='body2'>{v.value}</Typography>
              <IconButton
                size='small'
                onClick={() => {
                  if (confirm('Delete value?')) delVal.mutate(v.id)
                }}
              >
                <i className='ri-delete-bin-line text-textSecondary' />
              </IconButton>
            </li>
          ))}
        </ul>
        <Box className='flex gap-2 mts-3'>
          <TextField
            size='small'
            placeholder='New value'
            value={valueDraft}
            onChange={e => onDraftChange(e.target.value)}
          />
          <Button
            size='small'
            variant='contained'
            disabled={!valueDraft.trim() || addVal.isPending}
            onClick={async () => {
              await addVal.mutateAsync({ value: valueDraft.trim() })
              onDraftChange('')
            }}
          >
            Add
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
