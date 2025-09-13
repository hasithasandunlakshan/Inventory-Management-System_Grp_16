'use client';

import { useState, useEffect } from 'react';
import { categoryService } from '@/lib/services/categoryService';
import { Category } from '@/lib/types/product';
import LoadingScreen from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const fetchedCategories = await categoryService.getAllCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) return;

    try {
      const newCategory = await categoryService.createCategory({
        categoryName: categoryName.trim(),
      });
      setCategories([...categories, newCategory]);
      setCategoryName('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create category', error);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !categoryName.trim()) return;

    try {
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
    } catch (error) {
      console.error('Failed to update category', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (error) {
      console.error('Failed to delete category', error);
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.categoryName);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Categories</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='w-4 h-4 mr-2' />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new product category to organize your inventory.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <Input
                placeholder='Category name'
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateCategory}>Create Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {categories.length === 0 ? (
          <div className='col-span-full text-center text-gray-500 py-8'>
            No categories available. Create your first category to get started.
          </div>
        ) : (
          categories.map(category => (
            <Card
              key={category.id}
              className='hover:shadow-md transition-shadow'
            >
              <CardHeader className='pb-3'>
                <div className='flex justify-between items-start'>
                  <CardTitle className='text-lg'>
                    {category.categoryName}
                  </CardTitle>
                  <Badge variant='secondary'>ID: {category.id}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='flex space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => openEditDialog(category)}
                  >
                    <Edit className='w-4 h-4 mr-1' />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        className='text-red-600 hover:text-red-700'
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
                          delete the category "{category.categoryName}" and
                          remove it from all associated products.
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
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category name.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <Input
              placeholder='Category name'
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>Update Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
