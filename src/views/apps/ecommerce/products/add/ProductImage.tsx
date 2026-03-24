'use client'

import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useFormContext } from 'react-hook-form'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import type { BoxProps } from '@mui/material/Box'

// Component Imports
import Link from '@components/Link'
import CustomAvatar from '@core/components/mui/Avatar'
import AppReactDropzone from '@/libs/styles/AppReactDropzone'

type FileProp = {
  name: string
  type: string
  size: number
  preview?: string // ✅ added for URL preview
}

// Styled Dropzone
const Dropzone = styled(AppReactDropzone)<BoxProps>(({ theme }) => ({
  '& .dropzone': {
    minHeight: 'unset',
    padding: theme.spacing(12),
    [theme.breakpoints.down('sm')]: {
      paddingInline: theme.spacing(5)
    },
    '&+.MuiList-root .MuiListItem-root .file-name': {
      fontWeight: theme.typography.body1.fontWeight
    }
  }
}))

const ProductImage = ({ url }: { url: string }) => {
  console.log("url ----------",url)
  const { setValue, getValues } = useFormContext()

  // ✅ initialize with existing image if editing
  const [files, setFiles] = useState<File[]>([])

  useEffect(() => {
    if (url) {
      const existingFile: any = {
        name: url.split('/').pop(),
        type: 'image/*',
        size: 0,
        preview: url
      }

      setFiles([existingFile])
    } else {
      setFiles(getValues('image') || [])
    }
  }, [url])

  // Update form whenever files change
  useEffect(() => {
    setValue('image', files[0])
  }, [files, setValue])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      // Only allow one file: replace previous with the newly selected file
      if (acceptedFiles && acceptedFiles.length > 0) {
        setFiles([acceptedFiles[0]])
      }
    },
    multiple: false // Prevent multiple file selection at the input level
  })

  const handleRemoveFile = (file: FileProp) => {
    setFiles(prev => prev.filter(f => f.name !== file.name))
  }

  const handleRemoveAllFiles = () => {
    setFiles([])
  }

  const renderFilePreview = (file: FileProp) =>
    file.type.startsWith('image') ? (
      <img
        width={38}
        height={38}
        alt={file.name}
        src={file.preview || URL.createObjectURL(file as any)} // ✅ support URL
      />
    ) : (
      <i className='ri-file-text-line' />
    )

  const fileList = files.map(file => (
    <ListItem key={file.name} className='pis-4 plb-3'>
      <div className='file-details'>
        <div className='file-preview'>{renderFilePreview(file)}</div>
        <div>
          <Typography className='file-name font-medium' color='text.primary'>
            {file.name}
          </Typography>
          <Typography className='file-size' variant='body2'>
            {Math.round(file.size / 100) / 10 > 1000
              ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
              : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`}
          </Typography>
        </div>
      </div>
      <IconButton onClick={() => handleRemoveFile(file)}>
        <i className='ri-close-line text-xl' />
      </IconButton>
    </ListItem>
  ))

  return (
    <Dropzone>
      <Card>
        <CardHeader
          title='Product Image'
          action={
            <Typography component={Link} color='primary.main' className='font-medium'>
              Add media from URL
            </Typography>
          }
          sx={{ '& .MuiCardHeader-action': { alignSelf: 'center' } }}
        />
        <CardContent>
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <div className='flex items-center flex-col gap-2 text-center'>
              <CustomAvatar variant='rounded' skin='light' color='secondary'>
                <i className='ri-upload-2-line' />
              </CustomAvatar>
              <Typography variant='h4'>Drag and Drop Your Image Here.</Typography>
              <Typography color='text.disabled'>or</Typography>
              <Button variant='outlined' size='small'>
                Browse Image
              </Button>
            </div>
          </div>

          {files.length > 0 && (
            <>
              <List>{fileList}</List>
              <div className='buttons flex gap-2 mt-2'>
                <Button color='error' variant='outlined' onClick={handleRemoveAllFiles}>
                  Remove All
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Dropzone>
  )
}

export default ProductImage