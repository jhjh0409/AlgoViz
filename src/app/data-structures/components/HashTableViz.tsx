'use client';

import { useState, useEffect } from 'react';

interface HashEntry {
  key: string;
  value: string;
  highlighted?: boolean;
}

interface HashTableState {
  size: number;
  table: (HashEntry[] | null)[];
  collisions: number;
  loadFactor: number;
}

const HashTableViz = () => {
  const [hashTable, setHashTable] = useState<HashTableState>({
    size: 10,
    table: Array(10).fill(null),
    collisions: 0,
    loadFactor: 0
  });
  
  const [keyInput, setKeyInput] = useState<string>('');
  const [valueInput, setValueInput] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [operationLog, setOperationLog] = useState<string[]>([]);
  const [animationInProgress, setAnimationInProgress] = useState<boolean>(false);
  
  // Calculate load factor whenever the table changes
  useEffect(() => {
    const itemCount = hashTable.table.filter(bucket => bucket !== null && bucket.length > 0).length;
    const loadFactor = itemCount / hashTable.size;
    
    setHashTable(prev => ({
      ...prev,
      loadFactor
    }));
  }, [hashTable.table]);
  
  // Simple hash function
  const hashFunction = (key: string, tableSize: number): number => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash + key.charCodeAt(i) * (i + 1)) % tableSize;
    }
    return hash;
  };
  
  // Insert a key-value pair
  const insertEntry = async () => {
    if (!keyInput || !valueInput) return;
    
    setAnimationInProgress(true);
    setOperationLog([`Inserting key "${keyInput}" with value "${valueInput}"...`]);
    
    const hash = hashFunction(keyInput, hashTable.size);
    setOperationLog(prev => [...prev, `Hash value for key "${keyInput}" is ${hash}`]);
    
    const newTable = [...hashTable.table];
    let newCollisions = hashTable.collisions;
    
    // Highlight the bucket
    await highlightBucket(hash);
    
    if (newTable[hash] === null) {
      newTable[hash] = [{ key: keyInput, value: valueInput }];
      setOperationLog(prev => [...prev, `Bucket ${hash} was empty. Inserting entry.`]);
    } else {
      // Check if key already exists
      const existingIndex = newTable[hash]!.findIndex(entry => entry.key === keyInput);
      
      if (existingIndex >= 0) {
        setOperationLog(prev => [...prev, `Key "${keyInput}" already exists in bucket ${hash}. Updating value.`]);
        newTable[hash]![existingIndex] = { key: keyInput, value: valueInput };
      } else {
        setOperationLog(prev => [...prev, `Collision detected at bucket ${hash}. Adding to chain.`]);
        newTable[hash]!.push({ key: keyInput, value: valueInput });
        newCollisions++;
      }
    }
    
    setHashTable(prev => ({
      ...prev,
      table: newTable,
      collisions: newCollisions
    }));
    
    setKeyInput('');
    setValueInput('');
    setOperationLog(prev => [...prev, `Insertion complete.`]);
    
    // Remove highlight after a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    await resetHighlights();
    
    setAnimationInProgress(false);
  };
  
  // Search for a key
  const searchKey = async () => {
    if (!searchInput) return;
    
    setAnimationInProgress(true);
    setSearchResult(null);
    setOperationLog([`Searching for key "${searchInput}"...`]);
    
    const hash = hashFunction(searchInput, hashTable.size);
    setOperationLog(prev => [...prev, `Hash value for key "${searchInput}" is ${hash}`]);
    
    // Highlight the bucket
    await highlightBucket(hash);
    
    if (hashTable.table[hash] === null) {
      setOperationLog(prev => [...prev, `Bucket ${hash} is empty. Key not found.`]);
      setSearchResult('Key not found');
    } else {
      const entry = hashTable.table[hash]!.find(entry => entry.key === searchInput);
      
      if (entry) {
        setOperationLog(prev => [...prev, `Key "${searchInput}" found in bucket ${hash} with value "${entry.value}".`]);
        setSearchResult(`Value: ${entry.value}`);
      } else {
        setOperationLog(prev => [...prev, `Key "${searchInput}" not found in bucket ${hash}.`]);
        setSearchResult('Key not found');
      }
    }
    
    // Remove highlight after a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    await resetHighlights();
    
    setAnimationInProgress(false);
  };
  
  // Delete a key
  const deleteKey = async () => {
    if (!searchInput) return;
    
    setAnimationInProgress(true);
    setSearchResult(null);
    setOperationLog([`Deleting key "${searchInput}"...`]);
    
    const hash = hashFunction(searchInput, hashTable.size);
    setOperationLog(prev => [...prev, `Hash value for key "${searchInput}" is ${hash}`]);
    
    // Highlight the bucket
    await highlightBucket(hash);
    
    if (hashTable.table[hash] === null) {
      setOperationLog(prev => [...prev, `Bucket ${hash} is empty. Nothing to delete.`]);
    } else {
      const entryIndex = hashTable.table[hash]!.findIndex(entry => entry.key === searchInput);
      
      if (entryIndex >= 0) {
        const newTable = [...hashTable.table];
        newTable[hash] = [...newTable[hash]!];
        newTable[hash]!.splice(entryIndex, 1);
        
        // If bucket is now empty, set it to null
        if (newTable[hash]!.length === 0) {
          newTable[hash] = null;
        }
        
        setHashTable(prev => ({
          ...prev,
          table: newTable
        }));
        
        setOperationLog(prev => [...prev, `Key "${searchInput}" found and deleted from bucket ${hash}.`]);
      } else {
        setOperationLog(prev => [...prev, `Key "${searchInput}" not found in bucket ${hash}. Nothing to delete.`]);
      }
    }
    
    setSearchInput('');
    
    // Remove highlight after a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    await resetHighlights();
    
    setAnimationInProgress(false);
  };
  
  // Resize the hash table
  const resizeTable = async (newSize: number) => {
    if (animationInProgress) return;
    
    setAnimationInProgress(true);
    setOperationLog([`Resizing hash table from ${hashTable.size} to ${newSize}...`]);
    
    // Store all current entries
    const allEntries: HashEntry[] = [];
    hashTable.table.forEach(bucket => {
      if (bucket !== null) {
        allEntries.push(...bucket);
      }
    });
    
    // Create new table
    const newTable: (HashEntry[] | null)[] = Array(newSize).fill(null);
    let newCollisions = 0;
    
    // Reinsert all entries
    for (const entry of allEntries) {
      const hash = hashFunction(entry.key, newSize);
      
      if (newTable[hash] === null) {
        newTable[hash] = [{ key: entry.key, value: entry.value }];
      } else {
        newTable[hash]!.push({ key: entry.key, value: entry.value });
        newCollisions++;
      }
    }
    
    setHashTable({
      size: newSize,
      table: newTable,
      collisions: newCollisions,
      loadFactor: allEntries.length / newSize
    });
    
    setOperationLog(prev => [...prev, `Resize complete. ${allEntries.length} entries rehashed with ${newCollisions} collisions.`]);
    setAnimationInProgress(false);
  };
  
  // Highlight a specific bucket
  const highlightBucket = async (index: number) => {
    const newTable = [...hashTable.table];
    
    if (newTable[index] !== null) {
      newTable[index] = newTable[index]!.map(entry => ({ ...entry, highlighted: true }));
    }
    
    setHashTable(prev => ({
      ...prev,
      table: newTable
    }));
    
    await new Promise(resolve => setTimeout(resolve, 500));
  };
  
  // Reset all highlights
  const resetHighlights = async () => {
    const newTable = hashTable.table.map(bucket => {
      if (bucket === null) return null;
      return bucket.map(entry => ({ ...entry, highlighted: false }));
    });
    
    setHashTable(prev => ({
      ...prev,
      table: newTable
    }));
  };
  
  // Add sample data
  const addSampleData = () => {
    if (animationInProgress) return;
    
    setAnimationInProgress(true);
    setOperationLog([`Adding sample data...`]);
    
    const sampleData = [
      { key: 'apple', value: 'fruit' },
      { key: 'banana', value: 'fruit' },
      { key: 'carrot', value: 'vegetable' },
      { key: 'dog', value: 'animal' },
      { key: 'elephant', value: 'animal' },
      { key: 'frog', value: 'amphibian' },
      { key: 'guitar', value: 'instrument' },
    ];
    
    const newTable = [...hashTable.table];
    let newCollisions = hashTable.collisions;
    
    sampleData.forEach(({ key, value }) => {
      const hash = hashFunction(key, hashTable.size);
      
      if (newTable[hash] === null) {
        newTable[hash] = [{ key, value }];
      } else {
        // Check if key already exists
        const existingIndex = newTable[hash]!.findIndex(entry => entry.key === key);
        
        if (existingIndex >= 0) {
          newTable[hash]![existingIndex] = { key, value };
        } else {
          newTable[hash]!.push({ key, value });
          newCollisions++;
        }
      }
    });
    
    setHashTable(prev => ({
      ...prev,
      table: newTable,
      collisions: newCollisions
    }));
    
    setOperationLog(prev => [...prev, `Sample data added successfully.`]);
    setAnimationInProgress(false);
  };
  
  // Clear the hash table
  const clearTable = () => {
    if (animationInProgress) return;
    
    setAnimationInProgress(true);
    setOperationLog([`Clearing hash table...`]);
    
    setHashTable({
      size: hashTable.size,
      table: Array(hashTable.size).fill(null),
      collisions: 0,
      loadFactor: 0
    });
    
    setOperationLog(prev => [...prev, `Hash table cleared.`]);
    setAnimationInProgress(false);
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Hash Table Visualization</h2>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-lg mb-2">Operations</h3>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Key"
                className="p-2 border border-gray-300 rounded-md mr-2 w-1/2"
                disabled={animationInProgress}
              />
              <input
                type="text"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                placeholder="Value"
                className="p-2 border border-gray-300 rounded-md w-1/2"
                disabled={animationInProgress}
              />
            </div>
            <button
              onClick={insertEntry}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 w-full"
              disabled={animationInProgress || !keyInput || !valueInput}
            >
              Insert
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Key"
                className="p-2 border border-gray-300 rounded-md mr-2 flex-grow"
                disabled={animationInProgress}
              />
              {searchResult && (
                <div className={`px-3 py-1 rounded-md text-sm ${searchResult === 'Key not found' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {searchResult}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={searchKey}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                disabled={animationInProgress || !searchInput}
              >
                Search
              </button>
              <button
                onClick={deleteKey}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                disabled={animationInProgress || !searchInput}
              >
                Delete
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={addSampleData}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              disabled={animationInProgress}
            >
              Add Sample Data
            </button>
            <button
              onClick={clearTable}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              disabled={animationInProgress}
            >
              Clear Table
            </button>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Resize Hash Table</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => resizeTable(7)}
                className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md hover:bg-gray-300 text-sm"
                disabled={animationInProgress || hashTable.size === 7}
              >
                Size 7
              </button>
              <button
                onClick={() => resizeTable(10)}
                className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md hover:bg-gray-300 text-sm"
                disabled={animationInProgress || hashTable.size === 10}
              >
                Size 10
              </button>
              <button
                onClick={() => resizeTable(15)}
                className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md hover:bg-gray-300 text-sm"
                disabled={animationInProgress || hashTable.size === 15}
              >
                Size 15
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-lg mb-2">Operation Log</h3>
          <div className="p-4 bg-gray-100 rounded-md h-[200px] overflow-y-auto">
            {operationLog.length > 0 ? (
              <ul className="text-sm">
                {operationLog.map((log, index) => (
                  <li key={index} className="mb-1 pb-1 border-b border-gray-200 last:border-0">
                    {log}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No operations performed yet</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-lg">Hash Table</h3>
          <div className="flex gap-4 text-sm">
            <div>Size: <span className="font-medium">{hashTable.size}</span></div>
            <div>Collisions: <span className="font-medium">{hashTable.collisions}</span></div>
            <div>Load Factor: <span className="font-medium">{hashTable.loadFactor.toFixed(2)}</span></div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left w-16">Index</th>
                <th className="py-2 px-4 text-left">Entries</th>
              </tr>
            </thead>
            <tbody>
              {hashTable.table.map((bucket, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="py-2 px-4 font-mono">{index}</td>
                  <td className="py-2 px-4">
                    {bucket === null ? (
                      <span className="text-gray-400">Empty</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {bucket.map((entry, entryIndex) => (
                          <div
                            key={entryIndex}
                            className={`px-3 py-1 rounded-md text-sm ${entry.highlighted ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800'}`}
                          >
                            {entry.key}: {entry.value}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-indigo-50 p-4 rounded-md">
        <h3 className="font-medium text-lg mb-2">About Hash Tables</h3>
        <p className="text-gray-700 mb-2">
          A hash table is a data structure that implements an associative array abstract data type, a structure that can map keys to values. It uses a hash function to compute an index into an array of buckets, from which the desired value can be found.
        </p>
        <p className="text-gray-700 mb-2">
          This visualization uses chaining to handle collisions, where multiple key-value pairs that hash to the same index are stored in a linked list.
        </p>
        <p className="text-gray-700">
          Hash tables provide average-case O(1) time complexity for search, insert, and delete operations, making them extremely efficient for many applications.
        </p>
      </div>
    </div>
  );
};

export default HashTableViz;
