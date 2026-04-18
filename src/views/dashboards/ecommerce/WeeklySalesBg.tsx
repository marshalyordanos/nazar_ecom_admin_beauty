'use client'

import { useMemo, useState } from 'react'

import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import classnames from 'classnames'
import { useKeenSlider } from 'keen-slider/react'
import type { KeenSliderPlugin } from 'keen-slider/react'
import { useSelector } from 'react-redux'

import CustomAvatar from '@core/components/mui/Avatar'

import { useDashboardEcommerceHighlights } from '@/api/admin/dashboard'
import AppKeenSlider from '@/libs/styles/AppKeenSlider'
import type { RootState } from '@/redux-store'

type HighlightType = {
  categoryId: string
  categoryName: string
  revenue: number
  orderCount: number
  totalViews: number
  image: string | null
  topProduct: {
    productId: string
    productName: string
    revenue: number
    orderCount: number
    views: number
    image: string | null
  } | null
}

const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)

const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat('en', { maximumFractionDigits: value >= 1000 ? 0 : 2 }).format(value)} Br`

const Slides = ({ slides }: { slides: HighlightType[] }) => {
  const theme = useTheme()

  return (
    <>
      {slides.map(slide => {
        const details = [
          { label: 'Revenue', value: formatCurrency(slide.revenue) },
          { label: 'Orders', value: formatCompactNumber(slide.orderCount) },
          { label: 'Views', value: formatCompactNumber(slide.totalViews) },
          { label: 'Top Product Views', value: formatCompactNumber(slide.topProduct?.views ?? 0) }
        ]

        return (
          <div key={slide.categoryId} className='keen-slider__slide p-5 sm:p-6'>
            <Grid container spacing={4} alignItems='stretch'>
              <Grid size={{ xs: 12, md: 7 }}>
                <div className='flex h-full flex-col justify-between gap-5'>
                  <div className='flex flex-col gap-3'>
                    <div className='flex flex-wrap items-center gap-3'>
                      <Typography variant='h5' className='text-white'>
                        Category Highlights
                      </Typography>
                      <span className='rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-white/90'>
                        Live analytics
                      </span>
                    </div>

                    <div className='flex flex-col gap-1'>
                      <Typography variant='h4' className='text-white'>
                        {slide.categoryName}
                      </Typography>
                      <Typography className='max-is-[560px] text-white/80'>
                        Best selling product: {slide.topProduct?.productName ?? 'No top product yet'}
                      </Typography>
                    </div>
                  </div>

                  <Grid container spacing={3}>
                    {details.map((item, index) => (
                      <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                        <div className='flex h-full items-start gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm'>
                          <CustomAvatar
                            color='primary'
                            variant='rounded'
                            className='rounded-xl bg-primaryDark text-white bs-[42px] is-[42px] shrink-0'
                          >
                            <i
                              className={[
                                'ri-line-chart-line',
                                'ri-shopping-bag-3-line',
                                'ri-eye-line',
                                'ri-medal-line'
                              ][index]}
                            />
                          </CustomAvatar>
                          <div className='min-is-0'>
                            <Typography variant='body2' className='text-white/70'>
                              {item.label}
                            </Typography>
                            <Typography variant='h6' className='text-white break-words'>
                              {item.value}
                            </Typography>
                          </div>
                        </div>
                      </Grid>
                    ))}
                  </Grid>
                </div>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <div className='flex h-full min-h-[260px] flex-col justify-between rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm'>
                  <div className='flex items-center justify-between gap-3'>
                    <div>
                      <Typography variant='body2' className='text-white/70'>
                        Top Product
                      </Typography>
                      <Typography variant='h6' className='text-white'>
                        {slide.topProduct?.productName ?? 'No top product'}
                      </Typography>
                    </div>
                    <div className='rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85'>
                      {formatCompactNumber(slide.topProduct?.orderCount ?? 0)} orders
                    </div>
                  </div>

                  <div className='flex flex-1 items-center justify-center py-4'>
                    <Box
                      component='img'
                      src={slide.topProduct?.image ?? slide.image ?? '/images/cards/apple-watch-green-lg.png'}
                      alt={slide.topProduct?.productName ?? slide.categoryName}
                      className={classnames('max-h-[180px] w-auto max-w-full object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.25)]', {
                        'scale-x-[-1]': theme.direction === 'rtl'
                      })}
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <div className='rounded-2xl bg-black/10 px-3 py-2'>
                      <Typography variant='caption' className='text-white/65'>
                        Product Revenue
                      </Typography>
                      <Typography className='font-medium text-white'>
                        {formatCurrency(slide.topProduct?.revenue ?? 0)}
                      </Typography>
                    </div>
                    <div className='rounded-2xl bg-black/10 px-3 py-2'>
                      <Typography variant='caption' className='text-white/65'>
                        Product Views
                      </Typography>
                      <Typography className='font-medium text-white'>
                        {formatCompactNumber(slide.topProduct?.views ?? 0)}
                      </Typography>
                    </div>
                  </div>
                </div>
              </Grid>
            </Grid>
          </div>
        )
      })}
    </>
  )
}

const WeeklySalesBg = () => {
  const shop: any = useSelector((state: RootState) => state.shopReducer.shops)
  const { data, isLoading } = useDashboardEcommerceHighlights(shop?.[0]?.id, 3)

  const slides = useMemo<HighlightType[]>(() => {
    return Array.isArray(data?.categoryHighlights) ? data.categoryHighlights : []
  }, [data])

  const [loaded, setLoaded] = useState<boolean>(false)
  const [currentSlide, setCurrentSlide] = useState<number>(0)

  const theme = useTheme()

  const ResizePlugin: KeenSliderPlugin = slider => {
    const observer = new ResizeObserver(() => {
      slider.update()
    })

    slider.on('created', () => {
      observer.observe(slider.container)
    })
    slider.on('destroyed', () => {
      observer.unobserve(slider.container)
    })
  }

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: slides.length > 1,
      rtl: theme.direction === 'rtl',
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel)
      },
      created() {
        setLoaded(true)
      }
    },
    [
      ResizePlugin,
      slider => {
        let mouseOver = false
        let timeout: number | ReturnType<typeof setTimeout>

        const clearNextTimeout = () => {
          clearTimeout(timeout as number)
        }

        const nextTimeout = () => {
          clearTimeout(timeout as number)
          if (mouseOver || slides.length <= 1) return
          timeout = setTimeout(() => {
            slider.next()
          }, 3000)
        }

        slider.on('created', () => {
          slider.container.addEventListener('mouseover', () => {
            mouseOver = true
            clearNextTimeout()
          })
          slider.container.addEventListener('mouseout', () => {
            mouseOver = false
            nextTimeout()
          })
          nextTimeout()
        })
        slider.on('dragStarted', clearNextTimeout)
        slider.on('animationEnded', nextTimeout)
        slider.on('updated', nextTimeout)
      }
    ]
  )

  if (isLoading) {
    return (
      <AppKeenSlider className='bs-full'>
        <Card className='bg-primary bs-full p-5 sm:p-6'>
          <div className='flex flex-col gap-4'>
            <Skeleton
              variant='text'
              width={190}
              height={40}
              animation={false}
              sx={{ bgcolor: 'rgba(255,255,255,0.35)' }}
            />
            <Skeleton
              variant='text'
              width={280}
              height={28}
              animation={false}
              sx={{ bgcolor: 'rgba(255,255,255,0.25)' }}
            />
            <Grid container spacing={3}>
              {[0, 1, 2, 3].map(item => (
                <Grid key={item} size={{ xs: 12, sm: 6 }}>
                  <Skeleton
                    variant='rounded'
                    height={74}
                    animation={false}
                    sx={{ bgcolor: 'rgba(255,255,255,0.16)', borderRadius: '18px' }}
                  />
                </Grid>
              ))}
            </Grid>
          </div>
        </Card>
      </AppKeenSlider>
    )
  }

  if (!slides.length) {
    return (
      <AppKeenSlider className='bs-full'>
        <Card className='bg-primary bs-full p-5'>
          <Typography variant='h5' className='text-white'>
            Category Highlights
          </Typography>
          <Typography className='mt-2 text-white/80'>
            No category performance data is available yet for this shop.
          </Typography>
        </Card>
      </AppKeenSlider>
    )
  }

  return (
    <AppKeenSlider className='bs-full'>
      <Card className='bg-primary bs-full overflow-hidden'>
        <div ref={sliderRef} className='keen-slider relative bs-full min-h-[420px]'>
          {loaded && instanceRef.current && slides.length > 1 && (
            <div className='swiper-dots absolute top-5 inline-end-5 z-[2] rounded-full bg-white/10 px-3 py-2 backdrop-blur-sm'>
              {[...Array(instanceRef.current.track.details.slides.length).keys()].map(idx => {
                return (
                  <Badge
                    key={idx}
                    variant='dot'
                    component='div'
                    className={classnames('mie-[10px] last:m-0 cursor-pointer', {
                      active: currentSlide === idx
                    })}
                    onClick={() => {
                      instanceRef.current?.moveToIdx(idx)
                    }}
                    sx={{
                      '& .MuiBadge-dot': {
                        minWidth: '6px',
                        width: '6px !important',
                        height: '6px !important'
                      },
                      '&.active .MuiBadge-dot': {
                        backgroundColor: 'var(--mui-palette-common-white) !important'
                      }
                    }}
                  />
                )
              })}
            </div>
          )}
          <Slides slides={slides} />
        </div>
      </Card>
    </AppKeenSlider>
  )
}

export default WeeklySalesBg
