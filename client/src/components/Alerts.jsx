// Alerts.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const dummyAlerts = [
  {
    id: 1,
    type: 'Low Stock',
    product: 'Wireless Mouse',
    message: 'Stock below threshold (4 left)',
    time: '2 mins ago',
  },
  {
    id: 2,
    type: 'Expired',
    product: 'Hand Sanitizer',
    message: 'Product expired on 24 July 2025',
    time: '1 hour ago',
  },
];

export default function Alerts() {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-red-600 flex items-center gap-2 mb-6">
        <AlertTriangle className="w-6 h-6 text-red-500" /> Critical Alerts
      </h2>

      {dummyAlerts.length > 0 ? (
        <ul className="space-y-5">
          {dummyAlerts.map((alert) => (
            <li
              key={alert.id}
              className="p-4 rounded-lg border-l-4 border-red-600 bg-red-50 dark:bg-red-100/10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-300">
                    {alert.type} <span className="text-gray-800 dark:text-gray-200">{alert.product}</span>
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{alert.message}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 sm:mt-0 sm:ml-4 whitespace-nowrap">
                  {alert.time}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No alerts at the moment.</p>
      )}
    </div>
  );
}
