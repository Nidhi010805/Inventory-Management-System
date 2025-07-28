import db from '../../db/db';

export const saveOfflineAction = async (type, data) => {
  try {
    await db.products.add({ type, data });
    console.log(`Saved offline ${type} action`);
  } catch (error) {
    console.error('Failed to save offline action:', error);
  }
};
