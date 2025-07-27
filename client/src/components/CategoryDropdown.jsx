import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CategoryDropdown({ value, onChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories', {
          withCredentials: true, 
        });
       
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(Number(e.target.value))}
      required
      className="bg-[#1a253c] text-white border border-gray-600 rounded px-4 py-2 w-full"
    >
      <option value="">Select Category</option>

      {loading && <option disabled>Loading...</option>}

      {error && <option disabled>{error}</option>}

      {!loading && !error && categories.length === 0 && (
        <option disabled>No categories found</option>
      )}

      {!loading && !error && categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}
