'use client'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'

// Third-party Components
import classnames from 'classnames'
import { useDashboardShopKpi } from '@/api/admin/dashboard'
import { RootState } from '@/redux-store'
import { useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'

import { formatAmountEt } from '@/libs/currency'

const Award = ({ shopKPI }: { shopKPI: any }) => {
  const theme = useTheme()
  
  // State: 0 for revenue, 1 for transaction
  const [showMode, setShowMode] = useState<0|1>(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setShowMode(mode => (mode === 0 ? 1 : 0))
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  // Change title and description
  const title = "Shop Performance Highlight"
  const description = showMode === 0 
    ? "Top revenue achieved recently"
    : "Total transactions made"

  // Metric value and description
  const mainValue =
    showMode === 0
      ? shopKPI?.revenue !== undefined
        ? formatAmountEt(Number(shopKPI.revenue))
        : '--'
      : shopKPI?.totalTransactions !== undefined
        ? shopKPI.totalTransactions
        : '--'
  const subValue = showMode === 0
    ? 'Revenue'
    : 'Transaction Count'

  return (
    <Card className='relative bs-full'>
      <CardContent>
        <div className='flex flex-col items-start gap-2.5'>
          <div className='flex flex-col'>
            <Typography variant='h5'>
              {title}
            </Typography>
            <Typography variant='subtitle1'>{description}</Typography>
          </div>
          <div className='flex flex-col'>
            <Typography variant='h5' color='primary.main'>
              {mainValue}
            </Typography>
            <Typography>
              {subValue}
            </Typography>
          </div>
          <Button size='small' variant='contained'>
            View Sales
          </Button>
        </div>
        <img
          src='/images/cards/trophy.png'
          className={classnames('is-[106px] absolute block-end-0 inline-end-5', {
            'scale-x-[-1]': theme.direction === 'rtl'
          })}
        />
      </CardContent>
    </Card>
  )
}

export default Award
