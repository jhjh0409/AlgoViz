'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Sorting algorithms
const algorithms = {
  bubbleSort: {
    name: 'Bubble Sort',
    execute: async (array: number[], setArray: Function, speed: number) => {
      const arr = [...array];
      const n = arr.length;
      
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          if (arr[j] > arr[j + 1]) {
            // Swap elements
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            setArray([...arr]);
            await new Promise(resolve => setTimeout(resolve, speed));
          }
        }
      }
      return arr;
    }
  },
  selectionSort: {
    name: 'Selection Sort',
    execute: async (array: number[], setArray: Function, speed: number) => {
      const arr = [...array];
      const n = arr.length;
      
      for (let i = 0; i < n; i++) {
        let minIndex = i;
        
        for (let j = i + 1; j < n; j++) {
          if (arr[j] < arr[minIndex]) {
            minIndex = j;
          }
        }
        
        if (minIndex !== i) {
          // Swap elements
          [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
          setArray([...arr]);
          await new Promise(resolve => setTimeout(resolve, speed));
        }
      }
      return arr;
    }
  },
  insertionSort: {
    name: 'Insertion Sort',
    execute: async (array: number[], setArray: Function, speed: number) => {
      const arr = [...array];
      const n = arr.length;
      
      for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        
        while (j >= 0 && arr[j] > key) {
          arr[j + 1] = arr[j];
          j = j - 1;
          setArray([...arr]);
          await new Promise(resolve => setTimeout(resolve, speed));
        }
        
        arr[j + 1] = key;
        setArray([...arr]);
        await new Promise(resolve => setTimeout(resolve, speed));
      }
      return arr;
    }
  },
  quickSort: {
    name: 'Quick Sort',
    execute: async (array: number[], setArray: Function, speed: number) => {
      const arr = [...array];
      
      const partition = async (arr: number[], low: number, high: number) => {
        const pivot = arr[high];
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
          if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            setArray([...arr]);
            await new Promise(resolve => setTimeout(resolve, speed));
          }
        }
        
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        setArray([...arr]);
        await new Promise(resolve => setTimeout(resolve, speed));
        
        return i + 1;
      };
      
      const quickSort = async (arr: number[], low: number, high: number) => {
        if (low < high) {
          const pi = await partition(arr, low, high);
          await quickSort(arr, low, pi - 1);
          await quickSort(arr, pi + 1, high);
        }
      };
      
      await quickSort(arr, 0, arr.length - 1);
      return arr;
    }
  },
  mergeSort: {
    name: 'Merge Sort',
    execute: async (array: number[], setArray: Function, speed: number) => {
      const arr = [...array];
      
      const merge = async (arr: number[], l: number, m: number, r: number) => {
        const n1 = m - l + 1;
        const n2 = r - m;
        
        const L = new Array(n1);
        const R = new Array(n2);
        
        for (let i = 0; i < n1; i++) {
          L[i] = arr[l + i];
        }
        
        for (let j = 0; j < n2; j++) {
          R[j] = arr[m + 1 + j];
        }
        
        let i = 0;
        let j = 0;
        let k = l;
        
        while (i < n1 && j < n2) {
          if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
          } else {
            arr[k] = R[j];
            j++;
          }
          k++;
          setArray([...arr]);
          await new Promise(resolve => setTimeout(resolve, speed));
        }
        
        while (i < n1) {
          arr[k] = L[i];
          i++;
          k++;
          setArray([...arr]);
          await new Promise(resolve => setTimeout(resolve, speed));
        }
        
        while (j < n2) {
          arr[k] = R[j];
          j++;
          k++;
          setArray([...arr]);
          await new Promise(resolve => setTimeout(resolve, speed));
        }
      };
      
      const mergeSort = async (arr: number[], l: number, r: number) => {
        if (l < r) {
          const m = Math.floor(l + (r - l) / 2);
          await mergeSort(arr, l, m);
          await mergeSort(arr, m + 1, r);
          await merge(arr, l, m, r);
        }
      };
      
      await mergeSort(arr, 0, arr.length - 1);
      return arr;
    }
  }
};

export default function Visualizer() {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState<number>(50);
  const [speed, setSpeed] = useState<number>(50);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('bubbleSort');
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate a random array
  const generateArray = () => {
    const newArray = [];
    for (let i = 0; i < arraySize; i++) {
      newArray.push(Math.floor(Math.random() * 100) + 5);
    }
    setArray(newArray);
  };
  
  // Initialize array on component mount and when array size changes
  useEffect(() => {
    generateArray();
  }, [arraySize]);
  
  // Start sorting
  const startSorting = async () => {
    if (isSorting) return;
    
    setIsSorting(true);
    
    const algorithm = algorithms[selectedAlgorithm as keyof typeof algorithms];
    await algorithm.execute(array, setArray, 101 - speed);
    
    setIsSorting(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">AlgoViz Sorting Visualizer</h1>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800">
            Back to Home
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Algorithm</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                disabled={isSorting}
              >
                {Object.entries(algorithms).map(([key, algorithm]) => (
                  <option key={key} value={key}>
                    {algorithm.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Array Size</label>
              <input
                type="range"
                min="10"
                max="100"
                value={arraySize}
                onChange={(e) => setArraySize(parseInt(e.target.value))}
                className="w-full"
                disabled={isSorting}
              />
              <div className="text-xs text-gray-500 text-center">{arraySize}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Speed</label>
              <input
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-full"
                disabled={isSorting}
              />
              <div className="text-xs text-gray-500 text-center">{speed}%</div>
            </div>
            
            <div className="flex items-end">
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 mr-2 w-full"
                onClick={startSorting}
                disabled={isSorting}
              >
                {isSorting ? 'Sorting...' : 'Start Sorting'}
              </button>
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 w-full"
                onClick={generateArray}
                disabled={isSorting}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg" ref={containerRef}>
          <div className="h-64 flex items-end justify-center">
            {array.map((value, index) => (
              <div
                key={index}
                className="bg-indigo-600 mx-[1px]"
                style={{
                  height: `${value}%`,
                  width: `${100 / arraySize}%`,
                  maxWidth: '20px',
                  minWidth: '2px'
                }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-indigo-600 mb-4">Algorithm Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-lg mb-2">
                {algorithms[selectedAlgorithm as keyof typeof algorithms].name}
              </h3>
              <p className="text-gray-600">
                {selectedAlgorithm === 'bubbleSort' && 
                  'Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.'}
                {selectedAlgorithm === 'selectionSort' && 
                  'Selection Sort divides the input list into two parts: a sorted sublist and an unsorted sublist. It repeatedly finds the minimum element from the unsorted sublist and moves it to the end of the sorted sublist.'}
                {selectedAlgorithm === 'insertionSort' && 
                  'Insertion Sort builds the final sorted array one item at a time. It is much less efficient on large lists than more advanced algorithms such as quicksort, heapsort, or merge sort.'}
                {selectedAlgorithm === 'quickSort' && 
                  'Quick Sort is an efficient, divide-and-conquer sorting algorithm that works by selecting a pivot element and partitioning the array around the pivot.'}
                {selectedAlgorithm === 'mergeSort' && 
                  'Merge Sort is an efficient, divide-and-conquer sorting algorithm that divides the input array into two halves, recursively sorts them, and then merges the sorted halves.'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-lg mb-2">Time Complexity</h3>
              <ul className="text-gray-600">
                <li><strong>Best Case:</strong> {
                  selectedAlgorithm === 'bubbleSort' ? 'O(n)' :
                  selectedAlgorithm === 'selectionSort' ? 'O(n²)' :
                  selectedAlgorithm === 'insertionSort' ? 'O(n)' :
                  selectedAlgorithm === 'quickSort' ? 'O(n log n)' :
                  selectedAlgorithm === 'mergeSort' ? 'O(n log n)' : ''
                }</li>
                <li><strong>Average Case:</strong> {
                  selectedAlgorithm === 'bubbleSort' ? 'O(n²)' :
                  selectedAlgorithm === 'selectionSort' ? 'O(n²)' :
                  selectedAlgorithm === 'insertionSort' ? 'O(n²)' :
                  selectedAlgorithm === 'quickSort' ? 'O(n log n)' :
                  selectedAlgorithm === 'mergeSort' ? 'O(n log n)' : ''
                }</li>
                <li><strong>Worst Case:</strong> {
                  selectedAlgorithm === 'bubbleSort' ? 'O(n²)' :
                  selectedAlgorithm === 'selectionSort' ? 'O(n²)' :
                  selectedAlgorithm === 'insertionSort' ? 'O(n²)' :
                  selectedAlgorithm === 'quickSort' ? 'O(n²)' :
                  selectedAlgorithm === 'mergeSort' ? 'O(n log n)' : ''
                }</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
