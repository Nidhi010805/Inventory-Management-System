import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');

  const fetchCategories = () => {
    axiosClient.get('/categories')
      .then(res => setCategories(res.data))
      .catch(() => setError('Failed to load categories'));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError('');
    if (!newCategory) {
      setError('Category name required');
      return;
    }

    try {
      await axiosClient.post('/categories', { name: newCategory });
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axiosClient.delete(`/categories/${id}`);
      fetchCategories();
    } catch {
      alert('Failed to delete category');
    }
  };

  return (
    <div>
      <h2>Categories</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}

      <form onSubmit={handleAddCategory}>
        <input
          type="text"
          placeholder="New Category Name"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          required
        />
        <button type="submit">Add Category</button>
      </form>

      <ul>
        {categories.map(cat => (
          <li key={cat.id}>
            {cat.name}
            <button onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
