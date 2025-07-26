// Logs.jsx
import React from 'react';
import { ClipboardList } from 'lucide-react';

const dummyLogs = [
  {
    id: 101,
    action: 'Added new product: USB Keyboard',
    user: 'Admin',
    time: 'Today, 10:15 AM',
  },
  {
    id: 102,
    action: 'Updated stock for: Wireless Mouse',
    user: 'Staff',
    time: 'Today, 09:40 AM',
  },
];

export default function Logs() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2 mb-4">
        <ClipboardList className="text-blue-600" /> Inventory Logs
      </h2>

      {dummyLogs.length > 0 ? (
        <ul className="space-y-4">
          {dummyLogs.map((log) => (
            <li key={log.id} className="p-4 bg-blue-50 rounded border-l-4 border-blue-500">
              <p className="font-medium">{log.action}</p>
              <p className="text-sm text-gray-600">By: {log.user}</p>
              <p className="text-xs text-gray-500 mt-1">{log.time}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No logs found.</p>
      )}
    </div>
  );
}
