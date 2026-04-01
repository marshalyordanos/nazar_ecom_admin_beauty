'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import AvatarGroup from '@mui/material/AvatarGroup'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import type { TypographyProps } from '@mui/material/Typography'
import type { CardProps } from '@mui/material/Card'

// Component Imports
import RoleDialog from '@components/dialogs/role-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import Link from '@components/Link'
import CustomAvatar from '@core/components/mui/Avatar'

// API Imports
import { useAdminRoles } from '@/api/admin/roles'
import { useAdminUsers } from '@/api/admin/users'

type CardDataType = {
  title: string
  avatars: string[]
  totalUsers: number
}

// Vars
const cardData: CardDataType[] = []

const RoleCards = () => {
  // Vars
  const typographyProps: TypographyProps = {
    children: 'Edit Role',
    component: Link,
    color: 'primary',
    onClick: e => e.preventDefault()
  }

  const CardProps: CardProps = {
    className: 'cursor-pointer bs-full',
    children: (
      <Grid container className='bs-full'>
        <Grid size={{ xs: 5 }}>
          <div className='flex items-end justify-center bs-full'>
            <img alt='add-role' src='/images/illustrations/characters/9.png' height={130} />
          </div>
        </Grid>
        <Grid size={{ xs: 7 }}>
          <CardContent>
            <div className='flex flex-col items-end gap-4 text-right'>
              <Button variant='contained' size='small'>
                Add Role
              </Button>
              <Typography>
                Add new role, <br />
                if it doesn&#39;t exist.
              </Typography>
            </div>
          </CardContent>
        </Grid>
      </Grid>
    )
  }

  // Data
  const { data: rolesResp, isLoading } = useAdminRoles({ page: 1, pageSize: 50, sort: { createdAt: 'asc' } })
  const dynamicCards: CardDataType[] =
    rolesResp?.data?.map(r => ({
      title: r.name,
      // Keep avatars static to preserve layout visuals
      avatars: ['1.png', '2.png', '3.png'],
      // If needed later, query counts per role; for now, display 0 when unknown
      totalUsers: 0
    })) ?? cardData

  return (
    <>
      <Grid container spacing={6}>
        {isLoading &&
          Array.from({ length: 6 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={`skeleton-${index}`}>
              <Card>
                <CardContent className='flex flex-col gap-4'>
                  <div className='flex items-center justify-between'>
                    <Skeleton variant='text' width={120} height={24} />
                    <div className='flex -space-x-2'>
                      <Skeleton variant='circular' width={40} height={40} />
                      <Skeleton variant='circular' width={40} height={40} />
                      <Skeleton variant='circular' width={40} height={40} />
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='flex flex-col items-start gap-1'>
                      <Skeleton variant='text' width={160} height={28} />
                      <Skeleton variant='text' width={100} height={20} />
                    </div>
                    <Skeleton variant='circular' width={36} height={36} />
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        {dynamicCards.map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
            <Card>
              <CardContent className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                  <Typography className='grow'>{`Total ${item.totalUsers} users`}</Typography>
                  <AvatarGroup total={item.totalUsers}>
                    {item.avatars.map((img, index: number) => (
                      <CustomAvatar key={index} alt={item.title} src={`/images/avatars/${img}`} size={40} />
                    ))}
                  </AvatarGroup>
                </div>
                <div className='flex justify-between items-center'>
                  <div className='flex flex-col items-start gap-1'>
                    <Typography variant='h5'>{item.title}</Typography>
                    <OpenDialogOnElementClick
                      element={Typography}
                      elementProps={typographyProps}
                      dialog={RoleDialog}
                      dialogProps={{ title: item.title }}
                    />
                  </div>
                  <IconButton>
                    <i className='ri-file-copy-line text-secondary' />
                  </IconButton>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <OpenDialogOnElementClick element={Card} elementProps={CardProps} dialog={RoleDialog} />
        </Grid>
      </Grid>
    </>
  )
}

export default RoleCards
