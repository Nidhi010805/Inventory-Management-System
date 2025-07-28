import React from 'react';

export default function CategoryDropdown({ categories = [], value, onChange }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(Number(e.target.value))}
      required
      className="bg-[#1a253c] text-white border border-gray-600 rounded px-4 py-2 w-full"
    >
      <option value="">Select Category</option>

      {categories.length === 0 && (
        <option disabled>No categories found</option>
      )}

      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}
