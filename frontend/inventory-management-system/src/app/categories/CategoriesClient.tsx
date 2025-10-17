'use client';

import { useState } from 'react';
import { categoryService } from '@/lib/services/categoryService';
import { Category } from '@/lib/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Tag,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CategoriesClientProps {
  readonly initialCategories: Category[];
}

export default function CategoriesClient({
  initialCategories,
}: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) return;

    try {
      setIsCreating(true);
      const newCategory = await categoryService.createCategory({
        categoryName: categoryName.trim(),
      });
      setCategories([...categories, newCategory]);
      setCategoryName('');
      setIsCreateDialogOpen(false);
      toast.success('Category created successfully!');
    } catch {
      toast.error('Failed to create category. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !categoryName.trim()) return;

    try {
      setIsUpdating(true);
      const updatedCategory = await categoryService.updateCategory(
        editingCategory.id,
        {
          categoryName: categoryName.trim(),
        }
      );
      setCategories(
        categories.map(cat =>
          cat.id === editingCategory.id ? updatedCategory : cat
        )
      );
      setCategoryName('');
      setEditingCategory(null);
      setIsEditDialogOpen(false);
      toast.success('Category updated successfully!');
    } catch {
      toast.error('Failed to update category. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));
      toast.success('Category deleted successfully!');
    } catch {
      toast.error('Failed to delete category. Please try again.');
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.categoryName);
    setIsEditDialogOpen(true);
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='space-y-6'>
      {/* Header Card with Search and Add Button */}
      <Card
        className='shadow-lg border-0'
        style={{
          background: 'linear-gradient(135deg, #2A7CC7 0%, #245e91ff 100%)',
        }}
      >
        <CardContent className='p-6'>
          <div className='flex flex-col sm:flex-row gap-4 items-center'>
            {/* Search */}
            <div className='flex-1 w-full relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 h-5 w-5' />
              <Input
                type='text'
                placeholder='Search categories...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10 h-11 bg-white/95 border-white/20 focus:bg-white placeholder:text-gray-400'
              />
            </div>

            {/* Add Category Button */}
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className='h-11 px-6 font-semibold bg-white text-blue-700 hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap'>
                  <Plus className='w-5 h-5 mr-2' />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className='text-2xl font-bold flex items-center gap-2'>
                    <Tag className='h-6 w-6' />
                    Create New Category
                  </DialogTitle>
                  <DialogDescription>
                    Add a new product category to organize your inventory.
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4 py-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='create-category-name'>Category Name</Label>
                    <Input
                      id='create-category-name'
                      placeholder='Enter category name'
                      value={categoryName}
                      onChange={e => setCategoryName(e.target.value)}
                      className='h-11'
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !isCreating) {
                          handleCreateCategory();
                        }
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setCategoryName('');
                    }}
                    disabled={isCreating}
                    className='h-10'
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateCategory}
                    disabled={isCreating || !categoryName.trim()}
                    className='h-10 font-semibold'
                    style={{
                      background:
                        'linear-gradient(135deg, #2A7CC7 0%, #245e91ff 100%)',
                    }}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className='w-4 h-4 mr-2' />
                        Create Category
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className='mt-4 pt-4 border-t border-white/20'>
            <div className='flex items-center gap-2 text-white'>
              <FolderOpen className='h-5 w-5' />
              <span className='text-sm font-medium'>
                {filteredCategories.length}{' '}
                {filteredCategories.length === 1 ? 'category' : 'categories'}
                {searchQuery && ` found matching "${searchQuery}"`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
        {filteredCategories.length === 0 ? (
          <div className='col-span-full text-center py-12'>
            <FolderOpen className='h-16 w-16 mx-auto text-gray-300 mb-4' />
            <p className='text-gray-500 mb-2'>
              {searchQuery
                ? 'No categories found matching your search'
                : 'No categories available'}
            </p>
            {!searchQuery && (
              <p className='text-sm text-gray-400'>
                Create your first category to get started.
              </p>
            )}
          </div>
        ) : (
          filteredCategories.map(category => (
            <Card
              key={category.id}
              className='group hover:shadow-xl transition-all duration-300 border bg-white'
            >
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg font-bold text-gray-900 flex items-center gap-2'>
                  <Tag className='h-5 w-5 text-blue-600' />
                  {category.categoryName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => openEditDialog(category)}
                    className='flex-1 h-9 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all'
                  >
                    <Edit className='w-4 h-4 mr-1' />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1 h-9 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all'
                      >
                        <Trash2 className='w-4 h-4 mr-1' />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the category &quot;{category.categoryName}
                          &quot; and remove it from all associated products.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(category.id)}
                          className='bg-red-600 hover:bg-red-700'
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold flex items-center gap-2'>
              <Edit className='h-6 w-6' />
              Edit Category
            </DialogTitle>
            <DialogDescription>Update the category name.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-category-name'>Category Name</Label>
              <Input
                id='edit-category-name'
                placeholder='Enter category name'
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
                className='h-11'
                onKeyDown={e => {
                  if (e.key === 'Enter' && !isUpdating) {
                    handleEditCategory();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsEditDialogOpen(false);
                setCategoryName('');
                setEditingCategory(null);
              }}
              disabled={isUpdating}
              className='h-10'
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditCategory}
              disabled={isUpdating || !categoryName.trim()}
              className='h-10 font-semibold'
              style={{
                background:
                  'linear-gradient(135deg, #2A7CC7 0%, #245e91ff 100%)',
              }}
            >
              {isUpdating ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className='w-4 h-4 mr-2' />
                  Update Category
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
