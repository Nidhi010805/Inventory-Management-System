import React from 'react';
import { Card, CardContent } from '../components/Card';

import { PackageCheck, ClipboardList } from 'lucide-react';

export default function StaffDashboard() {
  const stats = [
    { icon: <PackageCheck />, label: 'Total Products', value: 120 },
    { icon: <ClipboardList />, label: 'Inventory Logs', value: 220 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {stats.map(({ icon, label, value }) => (
        <Card key={label} className="bg-white shadow rounded-xl p-4">
          <CardContent className="flex flex-col items-center justify-center">
            <div className="text-blue-600 mb-2">{icon}</div>
            <div className="text-lg font-semibold text-gray-700">{label}</div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
