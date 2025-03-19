'use client';

import { useState } from 'react';
import Link from 'next/link';
import BinaryTreeViz from './components/BinaryTreeViz';
import HeapViz from './components/HeapViz';
import HashTableViz from './components/HashTableViz';

export default function DataStructures() {
  const [selectedStructure, setSelectedStructure] = useState<string>('binary-tree');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Data Structure Visualizer</h1>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800">
            Back to Home
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              className={`px-4 py-2 rounded-md ${selectedStructure === 'binary-tree' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              onClick={() => setSelectedStructure('binary-tree')}
            >
              Binary Tree
            </button>
            <button
              className={`px-4 py-2 rounded-md ${selectedStructure === 'heap' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              onClick={() => setSelectedStructure('heap')}
            >
              Heap
            </button>
            <button
              className={`px-4 py-2 rounded-md ${selectedStructure === 'hash-table' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              onClick={() => setSelectedStructure('hash-table')}
            >
              Hash Table
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          {selectedStructure === 'binary-tree' && <BinaryTreeViz />}
          {selectedStructure === 'heap' && <HeapViz />}
          {selectedStructure === 'hash-table' && <HashTableViz />}
        </div>
      </div>
    </div>
  );
}
