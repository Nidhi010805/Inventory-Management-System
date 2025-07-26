import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function InventoryLog() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      const res = await axiosClient.get('/inventory');  // ya backend ke hisaab se '/inventory/logs'
      setLogs(res.data);
    } catch (err) {
      setError('Failed to fetch inventory logs');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div>
      <h2>Inventory Movement Logs</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {logs.length === 0 ? (
        <p>No logs available</p>
      ) : (
        <table border="1" cellPadding="5" style={{borderCollapse: 'collapse', width: '100%'}}>
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Target</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.user?.name || 'Unknown'}</td>
                <td>{log.action}</td>
                <td>{log.target}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
