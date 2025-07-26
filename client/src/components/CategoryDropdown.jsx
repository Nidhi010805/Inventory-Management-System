import React from 'react';

const defaultCategories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Grocery' },
  { id: 3, name: 'Clothing' },
  { id: 4, name: 'Stationery' },
  { id: 5, name: 'Furniture' },
  { id: 6, name: 'Hardware' },
  { id: 7, name: 'Cleaning Supplies' },
  { id: 8, name: 'Healthcare' },
  { id: 9, name: 'Toys' },
  { id: 10, name: 'Books' },
  { id: 11, name: 'Beauty & Personal Care' },
  { id: 12, name: 'Kitchen Essentials' },
  { id: 13, name: 'Tools & Equipment' },
  { id: 14, name: 'Sports & Outdoors' },
  { id: 15, name: 'Automotive' }
];

export default function CategoryDropdown({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))} // Ensures the categoryId is sent as a number
      required
      className="bg-[#1a253c] text-white border border-gray-600 rounded px-4 py-2 w-full"
    >
      <option value="">Select Category</option>
      {defaultCategories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}
