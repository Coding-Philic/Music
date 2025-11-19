/* utils/idb.js
   Simple IndexedDB wrapper for storing song blobs (audio + image) and metadata.
*/
(function(){
  const DB_NAME = 'animesh_db_v1';
  const STORE_SONGS = 'songs';
  let _dbPromise = null;

  function openDB(){
    if(_dbPromise) return _dbPromise;
    _dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = (evt) => {
        const db = evt.target.result;
        if(!db.objectStoreNames.contains(STORE_SONGS)){
          db.createObjectStore(STORE_SONGS, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('Failed to open IDB'));
    });
    return _dbPromise;
  }

  async function addSong(meta, audioFile, imageFile){
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SONGS, 'readwrite');
      const store = tx.objectStore(STORE_SONGS);
      const entry = Object.assign({}, meta, { audio: audioFile, image: imageFile });
      const req = store.put(entry);
      req.onsuccess = () => resolve(entry);
      req.onerror = () => reject(req.error || new Error('Failed to store song'));
    });
  }

  async function getAllSongs(){
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SONGS, 'readonly');
      const store = tx.objectStore(STORE_SONGS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error || new Error('Failed to read songs'));
    });
  }

  async function clearSongs(){
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SONGS, 'readwrite');
      const store = tx.objectStore(STORE_SONGS);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || new Error('Failed to clear songs'));
    });
  }

  window.IDBStorage = {
    addSong,
    getAllSongs,
    clearSongs
  };
})();
