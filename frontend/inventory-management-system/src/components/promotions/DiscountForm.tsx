'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { discountService } from '@/lib/services/discountService';
import {
  CreateDiscountRequest,
  Discount,
  Product,
  UpdateDiscountRequest,
} from '@/lib/types/discount';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const discountSchema = z
  .object({
    discountCode: z
      .string()
      .min(3, 'Discount code must be at least 3 characters')
      .max(20, 'Discount code must not exceed 20 characters'),
    discountName: z
      .string()
      .min(5, 'Discount name must be at least 5 characters')
      .max(100, 'Discount name must not exceed 100 characters'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must not exceed 500 characters'),
    type: z.enum(['BILL_DISCOUNT', 'PRODUCT_DISCOUNT']),
    discountValue: z
      .number()
      .min(0.01, 'Discount value must be greater than 0')
      .max(10000, 'Discount value is too large'),
    isPercentage: z.boolean(),
    minOrderAmount: z
      .number()
      .min(0, 'Minimum order amount cannot be negative')
      .optional(),
    maxDiscountAmount: z
      .number()
      .min(0, 'Maximum discount amount cannot be negative')
      .optional(),
    validFrom: z.date(),
    validTo: z.date(),
    maxUsage: z.number().min(1, 'Maximum usage must be at least 1').optional(),
    maxUsagePerUser: z
      .number()
      .min(1, 'Maximum usage per user must be at least 1')
      .optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']),
  })
  .refine(data => data.validTo > data.validFrom, {
    message: 'End date must be after start date',
    path: ['validTo'],
  })
  .refine(
    data => {
      if (data.isPercentage && data.discountValue > 100) {
        return false;
      }
      return true;
    },
    {
      message: 'Percentage discount cannot exceed 100%',
      path: ['discountValue'],
    }
  );

type DiscountFormData = z.infer<typeof discountSchema>;

interface DiscountFormProps {
  discount?: Discount | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function DiscountForm({
  discount,
  onSave,
  onCancel,
}: DiscountFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductSelection, setShowProductSelection] = useState(false);

  const isEditMode = !!discount;

  const form = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      discountCode: discount?.discountCode || '',
      discountName: discount?.discountName || '',
      description: discount?.description || '',
      type: discount?.type || 'BILL_DISCOUNT',
      discountValue: discount?.discountValue || 0,
      isPercentage: discount?.isPercentage ?? true,
      minOrderAmount: discount?.minOrderAmount || undefined,
      maxDiscountAmount: discount?.maxDiscountAmount || undefined,
      validFrom: discount?.validFrom
        ? new Date(discount.validFrom)
        : new Date(),
      validTo: discount?.validTo
        ? new Date(discount.validTo)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      maxUsage: discount?.maxUsage || undefined,
      maxUsagePerUser: discount?.maxUsagePerUser || undefined,
      status: discount?.status ?? 'ACTIVE',
    },
  });

  const watchType = form.watch('type');
  const watchIsPercentage = form.watch('isPercentage');

  useEffect(() => {
    if (watchType === 'PRODUCT_DISCOUNT') {
      loadProducts();
      setShowProductSelection(true);
    } else {
      setShowProductSelection(false);
      setSelectedProducts([]);
    }
  }, [watchType]);

  // Load existing products when editing a product discount
  useEffect(() => {
    if (discount && discount.id && discount.type === 'PRODUCT_DISCOUNT') {
      loadExistingDiscountProducts();
    }
  }, [discount]);

  const loadExistingDiscountProducts = async () => {
    if (!discount?.id) return;

    try {
      const discountProducts = await discountService.getDiscountProducts(
        discount.id
      );
      // Convert DiscountProduct[] to Product[] format for the form
      const convertedProducts = discountProducts.products
        .filter(dp => dp.productName !== 'Product not found') // Filter out invalid products
        .map(dp => ({
          productId: dp.productId,
          name: dp.productName,
          description: dp.description || '',
          imageUrl: dp.imageUrl || '',
          price: dp.price || 0,
          stock: 0,
          reserved: 0,
          availableStock: 0,
          barcode: dp.productBarcode || '',
          categoryId: dp.category || undefined,
          categoryName: undefined,
        }));

      setSelectedProducts(convertedProducts);
    } catch (error) {
      console.error('Error loading existing discount products:', error);
      toast.error('Failed to load associated products.');
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const productList = await discountService.getAllProducts();
      setProducts(productList);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products. Please try again.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductToggle = (product: Product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.productId === product.productId);
      if (exists) {
        return prev.filter(p => p.productId !== product.productId);
      } else {
        return [...prev, product];
      }
    });
  };

  const onSubmit = async (data: DiscountFormData) => {
    try {
      setIsLoading(true);

      const formattedData = {
        ...data,
        validFrom: format(data.validFrom, "yyyy-MM-dd'T'HH:mm:ss"),
        validTo: format(data.validTo, "yyyy-MM-dd'T'HH:mm:ss"),
        minOrderAmount: data.minOrderAmount || undefined,
        maxDiscountAmount: data.maxDiscountAmount || undefined,
        maxUsage: data.maxUsage || undefined,
        maxUsagePerUser: data.maxUsagePerUser || undefined,
      };

      let savedDiscount: Discount;

      if (isEditMode && discount?.id) {
        // Update existing discount
        const updateData: UpdateDiscountRequest = {
          discountName: formattedData.discountName,
          description: formattedData.description,
          discountValue: formattedData.discountValue,
          isPercentage: formattedData.isPercentage,
          minOrderAmount: formattedData.minOrderAmount,
          maxDiscountAmount: formattedData.maxDiscountAmount,
          validFrom: formattedData.validFrom,
          validTo: formattedData.validTo,
          maxUsage: formattedData.maxUsage,
          maxUsagePerUser: formattedData.maxUsagePerUser,
          status: formattedData.status,
        };
        savedDiscount = await discountService.updateDiscount(
          discount.id,
          updateData
        );
      } else {
        // Create new discount
        const createData: CreateDiscountRequest =
          formattedData as CreateDiscountRequest;
        savedDiscount = await discountService.createDiscount(createData);
      }

      // Handle product selection for product-specific discounts
      if (
        data.type === 'PRODUCT_DISCOUNT' &&
        selectedProducts.length > 0 &&
        savedDiscount.id
      ) {
        const productIds = selectedProducts.map(p => p.productId);
        await discountService.addProductsToDiscount(savedDiscount.id, {
          productIds,
        });
      }

      toast.success(
        `Discount ${isEditMode ? 'updated' : 'created'} successfully.`
      );

      onSave();
    } catch (error) {
      console.error('Error saving discount:', error);
      toast.error(
        `Failed to ${isEditMode ? 'update' : 'create'} discount. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Configure the basic details of your discount
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='discountCode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g., SUMMER25'
                          {...field}
                          disabled={isEditMode} // Don't allow editing code
                        />
                      </FormControl>
                      <FormDescription>
                        Unique code customers will use
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select discount type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='BILL_DISCOUNT'>
                            Bill Discount
                          </SelectItem>
                          <SelectItem value='PRODUCT_DISCOUNT'>
                            Product Discount
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Bill discount applies to entire order, product discount
                        to specific items
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='discountName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., Summer Sale 25% Off'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Display name for the discount
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Describe your promotional campaign...'
                        className='resize-none'
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed description of the discount
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Discount Value */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Value</CardTitle>
              <CardDescription>
                Set the discount amount and type
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='discountValue'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Value *</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.01'
                          placeholder='25.00'
                          {...field}
                          onChange={e =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='isPercentage'
                  render={({ field }) => (
                    <FormItem className='flex flex-col justify-end'>
                      <FormLabel>Discount Type</FormLabel>
                      <div className='flex items-center space-x-2'>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label>
                          {field.value ? 'Percentage (%)' : 'Fixed Amount ($)'}
                        </Label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='maxDiscountAmount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Discount Amount</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.01'
                          placeholder='200.00'
                          disabled={!watchIsPercentage}
                          {...field}
                          onChange={e =>
                            field.onChange(
                              parseFloat(e.target.value) || undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {watchIsPercentage
                          ? 'Cap for percentage discounts'
                          : 'Not applicable for fixed amount'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='minOrderAmount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Order Amount</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='100.00'
                        {...field}
                        onChange={e =>
                          field.onChange(
                            parseFloat(e.target.value) || undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum order value required to use this discount
                      (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Validity Period */}
          <Card>
            <CardHeader>
              <CardTitle>Validity Period</CardTitle>
              <CardDescription>Set when the discount is valid</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='validFrom'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Valid From *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={date =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='validTo'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Valid To *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={date =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Usage Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits</CardTitle>
              <CardDescription>
                Control how many times the discount can be used
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='maxUsage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Total Usage</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='1000'
                          {...field}
                          onChange={e =>
                            field.onChange(
                              parseInt(e.target.value) || undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Total number of times this discount can be used
                        (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='maxUsagePerUser'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Usage Per User</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='3'
                          {...field}
                          onChange={e =>
                            field.onChange(
                              parseInt(e.target.value) || undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum times a single user can use this discount
                        (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                    <div className='space-y-0.5'>
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Enable or disable this discount
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === 'ACTIVE'}
                        onCheckedChange={checked =>
                          field.onChange(checked ? 'ACTIVE' : 'INACTIVE')
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Product Selection for Product Discounts */}
          {showProductSelection && (
            <Card>
              <CardHeader>
                <CardTitle>Product Selection</CardTitle>
                <CardDescription>
                  Choose which products this discount applies to
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProducts ? (
                  <div className='flex items-center justify-center py-8'>
                    <Loader2 className='h-6 w-6 animate-spin' />
                    <span className='ml-2'>Loading products...</span>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {selectedProducts.length > 0 && (
                      <div>
                        <Label className='text-sm font-medium'>
                          Selected Products ({selectedProducts.length})
                        </Label>
                        <div className='flex flex-wrap gap-2 mt-2'>
                          {selectedProducts.map(product => (
                            <Badge
                              key={product.productId}
                              variant='secondary'
                              className='flex items-center gap-1'
                            >
                              {product.name}
                              <X
                                className='h-3 w-3 cursor-pointer'
                                onClick={() => handleProductToggle(product)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className='text-sm font-medium'>
                        Available Products
                      </Label>
                      <div className='grid grid-cols-2 md:grid-cols-3 gap-3 mt-2 max-h-64 overflow-y-auto'>
                        {products.map(product => {
                          const isSelected = selectedProducts.some(
                            p => p.productId === product.productId
                          );
                          return (
                            <div
                              key={product.productId}
                              className={cn(
                                'border rounded-lg p-3 cursor-pointer transition-colors',
                                isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              )}
                              onClick={() => handleProductToggle(product)}
                            >
                              <div className='font-medium text-sm'>
                                {product.name}
                              </div>
                              <div className='text-xs text-muted-foreground'>
                                ${product.price}
                              </div>
                              <div className='text-xs text-muted-foreground'>
                                Stock: {product.availableStock}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className='flex justify-end space-x-3'>
            <Button type='button' variant='outline' onClick={onCancel}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isEditMode ? 'Update Discount' : 'Create Discount'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
