import Dexie from 'dexie';

const db = new Dexie('SmartInventoryDB');

db.version(1).stores({
  products: '++id, type', // id is auto-increment, type: 'create', 'update', 'delete'
});

export default db;
