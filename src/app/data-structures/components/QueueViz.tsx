'use client';

import { useState } from 'react';

interface QueueItem {
  value: string;
  highlighted?: boolean;
}

const QueueViz = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [operationLog, setOperationLog] = useState<string[]>([]);
  const [animationInProgress, setAnimationInProgress] = useState<boolean>(false);

  // Enqueue an item
  const enqueueItem = async () => {
    if (!inputValue || animationInProgress) return;

    setAnimationInProgress(true);
    setOperationLog([`Enqueuing "${inputValue}" to the queue...`]);

    const newItem: QueueItem = { value: inputValue, highlighted: true };
    setQueue(prev => [...prev, newItem]);
    setInputValue('');

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Remove highlight
    setQueue(prev => 
      prev.map((item, i) => 
        i === prev.length - 1 ? { ...item, highlighted: false } : item
      )
    );

    setOperationLog(prev => [...prev, `"${newItem.value}" enqueued.`]);
    setAnimationInProgress(false);
  };

  // Dequeue an item
  const dequeueItem = async () => {
    if (queue.length === 0 || animationInProgress) return;

    setAnimationInProgress(true);
    setOperationLog([`Dequeuing item from the queue...`]);

    // Highlight the first item
    setQueue(prev => 
      prev.map((item, i) => 
        i === 0 ? { ...item, highlighted: true } : item
      )
    );

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Remove the first item
    const dequeuedItem = queue[0];
    setQueue(prev => prev.slice(1));

    setOperationLog(prev => [...prev, `"${dequeuedItem.value}" dequeued.`]);
    setAnimationInProgress(false);
  };

  // Peek at the front item
  const peekItem = async () => {
    if (queue.length === 0 || animationInProgress) return;

    setAnimationInProgress(true);
    setOperationLog([`Peeking at the front of the queue...`]);

    // Highlight the front item
    setQueue(prev => 
      prev.map((item, i) => 
        i === 0 ? { ...item, highlighted: true } : item
      )
    );

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Remove highlight
    setQueue(prev => 
      prev.map(item => ({ ...item, highlighted: false }))
    );

    setOperationLog(prev => [...prev, `Front item is "${queue[0].value}".`]);
    setAnimationInProgress(false);
  };

  // Clear the queue
  const clearQueue = () => {
    if (animationInProgress) return;

    setAnimationInProgress(true);
    setOperationLog([`Clearing the queue...`]);
    setQueue([]);
    setOperationLog(prev => [...prev, `Queue cleared.`]);
    setAnimationInProgress(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Queue Visualization</h2>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-lg mb-2">Operations</h3>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Value"
                className="p-2 border border-gray-300 rounded-md mr-2 flex-grow"
                disabled={animationInProgress}
              />
              <button
                onClick={enqueueItem}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                disabled={animationInProgress || !inputValue}
              >
                Enqueue
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={dequeueItem}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                disabled={animationInProgress || queue.length === 0}
              >
                Dequeue
              </button>
              <button
                onClick={peekItem}
                className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
                disabled={animationInProgress || queue.length === 0}
              >
                Peek
              </button>
              <button
                onClick={clearQueue}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                disabled={animationInProgress || queue.length === 0}
              >
                Clear
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
          <h3 className="font-medium text-lg">Queue</h3>
          <div className="flex gap-4 text-sm">
            <div>Size: <span className="font-medium">{queue.length}</span></div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-md p-4 min-h-[150px]">
          {queue.length === 0 ? (
            <div className="text-center text-gray-400 py-8">Queue is empty</div>
          ) : (
            <div className="flex flex-row items-center space-x-2">
              {queue.map((item, index) => (
                <div 
                  key={index}
                  className={`p-3 border-2 ${
                    item.highlighted 
                      ? 'border-indigo-600 bg-indigo-100' 
                      : 'border-gray-300'
                  } rounded-md min-w-[100px] text-center relative`}
                >
                  <div className="font-medium">{item.value}</div>
                  {index === 0 && (
                    <div className="absolute -top-7 left-0 text-xs bg-indigo-600 text-white px-2 py-1 rounded">Front</div>
                  )}
                  {index === queue.length - 1 && (
                    <div className="absolute -bottom-7 right-0 text-xs bg-indigo-600 text-white px-2 py-1 rounded">Rear</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-indigo-50 p-4 rounded-md">
        <h3 className="font-medium text-lg mb-2">About Queues</h3>
        <p className="text-gray-700 mb-2">
          A queue is a linear data structure that follows the First In, First Out (FIFO) principle. 
          It has two main operations: enqueue (adds an element to the back) and dequeue (removes an element from the front).
        </p>
        <p className="text-gray-700 mb-2">
          Queues are used in many applications including task scheduling, breadth-first searches, 
          and handling of requests in servers.
        </p>
        <p className="text-gray-700">
          Time complexity: Enqueue, Dequeue and Peek operations all have O(1) time complexity.
        </p>
      </div>
    </div>
  );
};

export default QueueViz;