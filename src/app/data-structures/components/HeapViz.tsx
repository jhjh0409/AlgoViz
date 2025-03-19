'use client';

import { useState, useRef, useEffect } from 'react';

interface HeapNode {
  value: number;
  x?: number;
  y?: number;
  highlighted?: boolean;
}

const HeapViz = () => {
  const [heap, setHeap] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [heapType, setHeapType] = useState<'max' | 'min'>('max');
  const [animationInProgress, setAnimationInProgress] = useState<boolean>(false);
  const [operationLog, setOperationLog] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize a sample heap
  useEffect(() => {
    const sampleHeap = [90, 80, 70, 50, 60, 30, 20];
    setHeap(sampleHeap);
  }, []);
  
  // Draw the heap on canvas whenever it changes
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawHeap(ctx, heap);
      }
    }
  }, [heap]);
  
  // Draw the heap on canvas
  const drawHeap = (ctx: CanvasRenderingContext2D, heapArray: number[]) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    if (heapArray.length === 0) return;
    
    const nodeRadius = 25;
    const horizontalSpacing = ctx.canvas.width / Math.pow(2, Math.floor(Math.log2(heapArray.length)) + 1);
    const verticalSpacing = 80;
    
    // Calculate positions for each node
    const nodes: HeapNode[] = heapArray.map((value, index) => {
      const depth = Math.floor(Math.log2(index + 1));
      const position = index + 1 - Math.pow(2, depth);
      const totalNodesAtDepth = Math.pow(2, depth);
      const x = (position + 0.5) * (ctx.canvas.width / totalNodesAtDepth);
      const y = (depth + 1) * verticalSpacing;
      
      return {
        value,
        x,
        y,
        highlighted: false
      };
    });
    
    // Draw edges between nodes
    for (let i = 0; i < nodes.length; i++) {
      const leftChildIndex = 2 * i + 1;
      const rightChildIndex = 2 * i + 2;
      
      if (leftChildIndex < nodes.length) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x!, nodes[i].y!);
        ctx.lineTo(nodes[leftChildIndex].x!, nodes[leftChildIndex].y!);
        ctx.strokeStyle = '#6366F1';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      if (rightChildIndex < nodes.length) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x!, nodes[i].y!);
        ctx.lineTo(nodes[rightChildIndex].x!, nodes[rightChildIndex].y!);
        ctx.strokeStyle = '#6366F1';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    
    // Draw nodes
    nodes.forEach((node, index) => {
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = node.highlighted ? '#4F46E5' : '#EEF2FF';
      ctx.fill();
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw array index
      ctx.font = '12px Arial';
      ctx.fillStyle = '#6366F1';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`[${index}]`, node.x!, node.y! - nodeRadius - 5);
      
      // Draw value
      ctx.font = '16px Arial';
      ctx.fillStyle = node.highlighted ? '#FFFFFF' : '#4F46E5';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.value.toString(), node.x!, node.y!);
    });
  };
  
  // Insert a new value into the heap
  const insertValue = async () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;
    
    setAnimationInProgress(true);
    setOperationLog([`Inserting ${value} into the heap...`]);
    
    const newHeap = [...heap, value];
    setHeap(newHeap);
    setInputValue('');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Heapify up
    let currentIndex = newHeap.length - 1;
    
    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);
      
      // For max heap, parent should be greater than children
      // For min heap, parent should be less than children
      const shouldSwap = heapType === 'max'
        ? newHeap[parentIndex] < newHeap[currentIndex]
        : newHeap[parentIndex] > newHeap[currentIndex];
      
      if (shouldSwap) {
        setOperationLog(prev => [...prev, `Swapping ${newHeap[currentIndex]} with parent ${newHeap[parentIndex]}`]);
        
        // Swap
        [newHeap[parentIndex], newHeap[currentIndex]] = [newHeap[currentIndex], newHeap[parentIndex]];
        setHeap([...newHeap]);
        
        currentIndex = parentIndex;
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        break;
      }
    }
    
    setOperationLog(prev => [...prev, `Insertion complete. Heap is now balanced.`]);
    setAnimationInProgress(false);
  };
  
  // Extract the root (max or min) value from the heap
  const extractRoot = async () => {
    if (heap.length === 0) return;
    
    setAnimationInProgress(true);
    setOperationLog([`Extracting ${heapType === 'max' ? 'maximum' : 'minimum'} value (${heap[0]}) from the heap...`]);
    
    const newHeap = [...heap];
    const extractedValue = newHeap[0];
    
    // Replace root with last element
    newHeap[0] = newHeap[newHeap.length - 1];
    newHeap.pop();
    setHeap([...newHeap]);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (newHeap.length > 0) {
      setOperationLog(prev => [...prev, `Moving last element (${newHeap[0]}) to the root position.`]);
      
      // Heapify down
      let currentIndex = 0;
      
      while (true) {
        const leftChildIndex = 2 * currentIndex + 1;
        const rightChildIndex = 2 * currentIndex + 2;
        let targetIndex = currentIndex;
        
        // For max heap, find the largest among current, left, and right
        // For min heap, find the smallest among current, left, and right
        if (heapType === 'max') {
          if (leftChildIndex < newHeap.length && newHeap[leftChildIndex] > newHeap[targetIndex]) {
            targetIndex = leftChildIndex;
          }
          
          if (rightChildIndex < newHeap.length && newHeap[rightChildIndex] > newHeap[targetIndex]) {
            targetIndex = rightChildIndex;
          }
        } else {
          if (leftChildIndex < newHeap.length && newHeap[leftChildIndex] < newHeap[targetIndex]) {
            targetIndex = leftChildIndex;
          }
          
          if (rightChildIndex < newHeap.length && newHeap[rightChildIndex] < newHeap[targetIndex]) {
            targetIndex = rightChildIndex;
          }
        }
        
        if (targetIndex !== currentIndex) {
          setOperationLog(prev => [...prev, `Swapping ${newHeap[currentIndex]} with ${heapType === 'max' ? 'larger' : 'smaller'} child ${newHeap[targetIndex]}`]);
          
          // Swap
          [newHeap[currentIndex], newHeap[targetIndex]] = [newHeap[targetIndex], newHeap[currentIndex]];
          setHeap([...newHeap]);
          
          currentIndex = targetIndex;
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          break;
        }
      }
    }
    
    setOperationLog(prev => [...prev, `Extraction complete. Extracted value: ${extractedValue}`]);
    setAnimationInProgress(false);
  };
  
  // Build a heap from the current array
  const buildHeap = async () => {
    if (heap.length === 0) return;
    
    setAnimationInProgress(true);
    setOperationLog([`Building a ${heapType} heap from the current array...`]);
    
    const newHeap = [...heap];
    
    // Start from the last non-leaf node and heapify down
    for (let i = Math.floor(newHeap.length / 2) - 1; i >= 0; i--) {
      await heapifyDown(newHeap, i);
    }
    
    setOperationLog(prev => [...prev, `Heap construction complete.`]);
    setAnimationInProgress(false);
  };
  
  // Heapify down operation
  const heapifyDown = async (heapArray: number[], index: number) => {
    const leftChildIndex = 2 * index + 1;
    const rightChildIndex = 2 * index + 2;
    let targetIndex = index;
    
    setOperationLog(prev => [...prev, `Heapifying node at index ${index} with value ${heapArray[index]}`]);
    
    if (heapType === 'max') {
      if (leftChildIndex < heapArray.length && heapArray[leftChildIndex] > heapArray[targetIndex]) {
        targetIndex = leftChildIndex;
      }
      
      if (rightChildIndex < heapArray.length && heapArray[rightChildIndex] > heapArray[targetIndex]) {
        targetIndex = rightChildIndex;
      }
    } else {
      if (leftChildIndex < heapArray.length && heapArray[leftChildIndex] < heapArray[targetIndex]) {
        targetIndex = leftChildIndex;
      }
      
      if (rightChildIndex < heapArray.length && heapArray[rightChildIndex] < heapArray[targetIndex]) {
        targetIndex = rightChildIndex;
      }
    }
    
    if (targetIndex !== index) {
      setOperationLog(prev => [...prev, `Swapping ${heapArray[index]} with ${heapType === 'max' ? 'larger' : 'smaller'} child ${heapArray[targetIndex]}`]);
      
      // Swap
      [heapArray[index], heapArray[targetIndex]] = [heapArray[targetIndex], heapArray[index]];
      setHeap([...heapArray]);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Recursively heapify the affected subtree
      await heapifyDown(heapArray, targetIndex);
    }
  };
  
  // Perform heap sort
  const heapSort = async () => {
    if (heap.length <= 1) return;
    
    setAnimationInProgress(true);
    setOperationLog([`Starting heap sort (${heapType === 'max' ? 'ascending' : 'descending'} order)...`]);
    
    // First build the heap
    const newHeap = [...heap];
    
    // Build heap (rearrange array)
    for (let i = Math.floor(newHeap.length / 2) - 1; i >= 0; i--) {
      await heapifyDown(newHeap, i);
    }
    
    setOperationLog(prev => [...prev, `Heap constructed. Now extracting elements one by one...`]);
    
    // Extract elements one by one
    for (let i = newHeap.length - 1; i > 0; i--) {
      // Move current root to end
      setOperationLog(prev => [...prev, `Moving root (${newHeap[0]}) to the end of the sorted portion`]);
      
      [newHeap[0], newHeap[i]] = [newHeap[i], newHeap[0]];
      setHeap([...newHeap]);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call heapify on the reduced heap
      let currentIndex = 0;
      while (true) {
        const leftChildIndex = 2 * currentIndex + 1;
        const rightChildIndex = 2 * currentIndex + 2;
        let targetIndex = currentIndex;
        
        // Only consider elements in the unsorted portion (0 to i-1)
        if (heapType === 'max') {
          if (leftChildIndex < i && newHeap[leftChildIndex] > newHeap[targetIndex]) {
            targetIndex = leftChildIndex;
          }
          
          if (rightChildIndex < i && newHeap[rightChildIndex] > newHeap[targetIndex]) {
            targetIndex = rightChildIndex;
          }
        } else {
          if (leftChildIndex < i && newHeap[leftChildIndex] < newHeap[targetIndex]) {
            targetIndex = leftChildIndex;
          }
          
          if (rightChildIndex < i && newHeap[rightChildIndex] < newHeap[targetIndex]) {
            targetIndex = rightChildIndex;
          }
        }
        
        if (targetIndex !== currentIndex) {
          setOperationLog(prev => [...prev, `Heapifying: Swapping ${newHeap[currentIndex]} with ${newHeap[targetIndex]}`]);
          
          [newHeap[currentIndex], newHeap[targetIndex]] = [newHeap[targetIndex], newHeap[currentIndex]];
          setHeap([...newHeap]);
          
          currentIndex = targetIndex;
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          break;
        }
      }
    }
    
    setOperationLog(prev => [...prev, `Heap sort complete. Array is now sorted in ${heapType === 'max' ? 'ascending' : 'descending'} order.`]);
    setAnimationInProgress(false);
  };
  
  // Generate a random heap
  const generateRandomHeap = () => {
    if (animationInProgress) return;
    
    const size = Math.floor(Math.random() * 7) + 5; // Random size between 5 and 11
    const randomArray = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
    
    setHeap(randomArray);
    setOperationLog([`Generated a random array with ${size} elements.`]);
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Heap Visualization</h2>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-lg mb-2">Operations</h3>
          
          <div className="flex items-center mb-4">
            <select
              value={heapType}
              onChange={(e) => setHeapType(e.target.value as 'max' | 'min')}
              className="p-2 border border-gray-300 rounded-md mr-2"
              disabled={animationInProgress}
            >
              <option value="max">Max Heap</option>
              <option value="min">Min Heap</option>
            </select>
            
            <button
              onClick={generateRandomHeap}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              disabled={animationInProgress}
            >
              Random Heap
            </button>
          </div>
          
          <div className="flex items-center mb-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter a number"
              className="p-2 border border-gray-300 rounded-md mr-2"
              disabled={animationInProgress}
            />
            <button
              onClick={insertValue}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              disabled={animationInProgress}
            >
              Insert
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={extractRoot}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              disabled={animationInProgress || heap.length === 0}
            >
              Extract {heapType === 'max' ? 'Max' : 'Min'}
            </button>
            
            <button
              onClick={buildHeap}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              disabled={animationInProgress || heap.length <= 1}
            >
              Build Heap
            </button>
            
            <button
              onClick={heapSort}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 col-span-2"
              disabled={animationInProgress || heap.length <= 1}
            >
              Heap Sort
            </button>
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
      
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-[400px]"
        />
      </div>
      
      <div className="mt-6 bg-indigo-50 p-4 rounded-md">
        <h3 className="font-medium text-lg mb-2">About Heaps</h3>
        <p className="text-gray-700 mb-2">
          A heap is a specialized tree-based data structure that satisfies the heap property:
        </p>
        <ul className="list-disc pl-5 text-gray-700 mb-2">
          <li><strong>Max Heap:</strong> For any given node, the value of the node is greater than or equal to the values of its children.</li>
          <li><strong>Min Heap:</strong> For any given node, the value of the node is less than or equal to the values of its children.</li>
        </ul>
        <p className="text-gray-700">
          Heaps are commonly used in priority queues, heap sort, and graph algorithms like Dijkstra's shortest path.
        </p>
      </div>
    </div>
  );
};

export default HeapViz;
