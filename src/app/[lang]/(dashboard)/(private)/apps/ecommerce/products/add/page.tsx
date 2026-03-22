'use client'
// MUI Imports
import Grid from '@mui/material/Grid'
import {api} from '@/libs/api'
// Component Imports
import ProductAddHeader from '@views/apps/ecommerce/products/add/ProductAddHeader'
import ProductInformation from '@views/apps/ecommerce/products/add/ProductInformation'
import ProductImage from '@views/apps/ecommerce/products/add/ProductImage'
import ProductVariants from '@views/apps/ecommerce/products/add/ProductVariants'
import ProductInventory from '@views/apps/ecommerce/products/add/ProductInventory'
import ProductPricing from '@views/apps/ecommerce/products/add/ProductPricing'
import ProductOrganize from '@views/apps/ecommerce/products/add/ProductOrganize'
import { FormProvider, useForm } from 'react-hook-form'
import ProductInventory2 from '@/views/apps/ecommerce/products/add/ProductInventory2'
import { RootState } from '@/redux-store'
import { useSelector } from 'react-redux'
import { useRouter, useSearchParams } from 'next/navigation'
import { useProduct } from '@/api/products/useProduct'
import { useEffect } from 'react'
import { Box } from '@mui/material'

const eCommerceProductsAdd = () => {
  const shops:any = useSelector((state: RootState) => state.shopReducer.shops)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get productId and only_variation from query params
  const productId2 = searchParams.get('productId')
  const onlyVariation = searchParams.get('only_variation')
  const isUpdate = searchParams.get('isUpdate')

  const shouldFetch = Boolean(productId2) && isUpdate === 'true';

  const { data: product } = useProduct(productId2 ?? '', shouldFetch)

  // Add computed values for displaying brand/category names
  // in initial defaultValues, keep ids (for submission), but display names when we have a product

  const methods = useForm({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      brandId: '',
      brandName: '',
      categoryId: '',
      categoryName: '',
      status: 'ACTIVE',

      // variant
      sku: '',
      price: '',
      comparePrice: '',
      costPrice: '',
      weight: '',
      variantStatus: 'ACTIVE',
      image: null,

      // option values
      optionValueIds: []
    }
  })

  useEffect(() => {
    if (product) {
      methods.reset({
        name: product.name ?? '',
        slug: product.slug ?? '',
        description: product.description ?? '',
        shortDescription: product.shortDescription ?? '',
        brandId: product.brandId ?? '',
        categoryId: product.categoryId ?? '',
        status: product.status ?? 'ACTIVE',
        brandName: product.brand?.name ?? '',         // <-- add brandName
        categoryName: product.category?.name ?? ''    // <-- add categoryName
      });
    }
  }, [product, methods]);
  const { handleSubmit } = methods

  const onSubmit = async (data: any) => {
    console.log("shops onSubmit", shops)

    try {
      const productData = {
        shopId: shops[0].id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription,
        brandId: data.brandId,
        categoryId: data.categoryId,
        status: data.status,
      }
      let productId = null;
      if (!onlyVariation && !isUpdate) {
      // 1️⃣ Create Product using axios (api)
      const productRes = await api.post('/products',productData );
      const product = productRes.data;
      productId = product.id;
    }
    if(isUpdate){
      const productRes = await api.patch(`/products/${productId2}`,productData );
    }

    if (!isUpdate) {
      // 2️⃣ Create Variant for that product, send FormData if image present
      const formData = new FormData();
      formData.append('sku', data.sku);
      if (data.barcode) formData.append('barcode', data.barcode);
      formData.append('price', data.price ? String(Number(data.price)) : '');
      if (data.comparePrice) formData.append('comparePrice', String(Number(data.comparePrice)));
      if (data.costPrice) formData.append('costPrice', String(Number(data.costPrice)));
      if (data.weight) formData.append('weight', String(Number(data.weight)));
      formData.append('status', data.variantStatus ?? '');
      if (data.locationId) formData.append('locationId', data.locationId);
      if (data.type) formData.append('type', data.type);
      formData.append('quantity', data.quantity ? String(Number(data.quantity)) : '0');
      // Append the image file if present
      if (data.image) {
        formData.append('image', data.image);
      }

      const variantRes = await api.post(`/products/${onlyVariation ? productId2 : productId}/variants`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Let browser set Content-Type (multipart/form-data including correct boundary)
        },
      });

      const variant = variantRes.data;
      const variantId = variant.id;

      // 3️⃣ Add Option Values to Variant
      const optionRes = await api.post(`/products/variants/${variantId}/option-values`, {
        optionValueIds: data.optionValueIds,
      });

      console.log('✅ All requests successful');
    }
      // Navigate to the product list page after successful submit
      router.push('/apps/ecommerce/products/list')
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
      <Box
      sx={{
        padding:5,
      
        marginBottom:3,
        position: 'sticky',
        top: 65,
        borderBottom: '1px solid #3d4964',
        zIndex: 1100,
        backgroundColor: 'background.paper',
        py: 5
      }}
    >
      <ProductAddHeader productId={productId2 ?? undefined} />
    </Box>
    <Grid container spacing={6}>
      {/* <Grid size={{ xs: 12 }}>
        
        <ProductAddHeader productId={productId2 ?? undefined} />
      </Grid> */}
      <Grid size={{ xs: 12, md: onlyVariation ? 12 : 8 }}>
        <Grid container spacing={6}>
         { !onlyVariation && <Grid size={{ xs: 12 }}>
            <ProductInformation />
          </Grid>}
         {!isUpdate&& <p className='text-lg font-bold'>Variants</p>}
         {!isUpdate&& <Grid size={{ xs: 12 }}>
            <ProductImage />
          </Grid>}
         { !isUpdate&& <Grid size={{ xs: 12 }}>
            <ProductPricing />
          </Grid>}
          {!isUpdate&& <Grid size={{ xs: 12 }}>
            <ProductVariants />
          </Grid>}
        
          {!isUpdate&& <Grid size={{ xs: 12 }}>
            <ProductInventory2 />
          </Grid>}
        </Grid>
      </Grid>
    { !onlyVariation && <Grid size={{ xs: 12, md: 4 }}>
        <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
            <ProductOrganize />
          </Grid>
         
          
        </Grid>
      </Grid>}
    </Grid>
    </form>
    </FormProvider>
  )
}

export default eCommerceProductsAdd
