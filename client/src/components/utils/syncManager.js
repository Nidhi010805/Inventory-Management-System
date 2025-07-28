import db from '../../db/db';
import axios from 'axios';

export const syncOfflineData = async () => {
  const unsynced = await db.products.toArray();

  for (const item of unsynced) {
    try {
      const { type, data } = item;

      if (type === 'create') {
        await axios.post('/api/products', data);
      } else if (type === 'update') {
        await axios.put(`/api/products/${data.id}`, data);
      } else if (type === 'delete') {
        await axios.delete(`/api/products/${data.id}`);
      }

      await db.products.delete(item.id); // remove after successful sync
      console.log(`✅ Synced ${type} for ${data.name}`);
    } catch (err) {
      console.error("❌ Sync failed for", item, err);
    }
  }
};
