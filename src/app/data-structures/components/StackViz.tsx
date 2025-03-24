'use client';

import { useState } from 'react';

interface StackItem {
  value: string;
  highlighted?: boolean;
}

const StackViz = () => {
  const [stack, setStack] = useState<StackItem[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [operationLog, setOperationLog] = useState<string[]>([]);
  const [animationInProgress, setAnimationInProgress] = useState<boolean>(false);

  // Push item to stack
  const pushItem = async () => {
    if (!inputValue || animationInProgress) return;

    setAnimationInProgress(true);
    setOperationLog([`Pushing "${inputValue}" to the stack...`]);

    const newItem: StackItem = { value: inputValue, highlighted: true };
    setStack(prev => [...prev, newItem]);
    setInputValue('');

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Remove highlight
    setStack(prev => 
      prev.map((item, i) => 
        i === prev.length - 1 ? { ...item, highlighted: false } : item
      )
    );

    setOperationLog(prev => [...prev, `"${newItem.value}" pushed to stack.`]);
    setAnimationInProgress(false);
  };

  // Pop item from stack
  const popItem = async () => {
    if (stack.length === 0 || animationInProgress) return;

    setAnimationInProgress(true);
    setOperationLog([`Popping item from the stack...`]);

    // Highlight the top item
    setStack(prev => 
      prev.map((item, i) => 
        i === prev.length - 1 ? { ...item, highlighted: true } : item
      )
    );

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Remove the top item
    const poppedItem = stack[stack.length - 1];
    setStack(prev => prev.slice(0, -1));

    setOperationLog(prev => [...prev, `"${poppedItem.value}" popped from stack.`]);
    setAnimationInProgress(false);
  };

  // Peek at the top item
  const peekItem = async () => {
    if (stack.length === 0 || animationInProgress) return;

    setAnimationInProgress(true);
    setOperationLog([`Peeking at the top of the stack...`]);

    // Highlight the top item
    setStack(prev => 
      prev.map((item, i) => 
        i === prev.length - 1 ? { ...item, highlighted: true } : item
      )
    );

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Remove highlight
    setStack(prev => 
      prev.map(item => ({ ...item, highlighted: false }))
    );

    setOperationLog(prev => [...prev, `Top item is "${stack[stack.length - 1].value}".`]);
    setAnimationInProgress(false);
  };

  // Clear the stack
  const clearStack = () => {
    if (animationInProgress) return;

    setAnimationInProgress(true);
    setOperationLog([`Clearing the stack...`]);
    setStack([]);
    setOperationLog(prev => [...prev, `Stack cleared.`]);
    setAnimationInProgress(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Stack Visualization</h2>
      
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
                onClick={pushItem}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                disabled={animationInProgress || !inputValue}
              >
                Push
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={popItem}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                disabled={animationInProgress || stack.length === 0}
              >
                Pop
              </button>
              <button
                onClick={peekItem}
                className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
                disabled={animationInProgress || stack.length === 0}
              >
                Peek
              </button>
              <button
                onClick={clearStack}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                disabled={animationInProgress || stack.length === 0}
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
          <h3 className="font-medium text-lg">Stack</h3>
          <div className="flex gap-4 text-sm">
            <div>Size: <span className="font-medium">{stack.length}</span></div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-md p-4 flex flex-col-reverse">
          {stack.length === 0 ? (
            <div className="text-center text-gray-400 py-8">Stack is empty</div>
          ) : (
            <div className="flex flex-col-reverse space-y-reverse space-y-2">
              {stack.map((item, index) => (
                <div 
                  key={index}
                  className={`p-3 border-2 ${
                    item.highlighted 
                      ? 'border-indigo-600 bg-indigo-100' 
                      : 'border-gray-300'
                  } rounded-md flex justify-between items-center`}
                >
                  <div className="font-medium">{item.value}</div>
                  {index === stack.length - 1 && (
                    <div className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">Top</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-indigo-50 p-4 rounded-md">
        <h3 className="font-medium text-lg mb-2">About Stacks</h3>
        <p className="text-gray-700 mb-2">
          A stack is a linear data structure that follows the Last In, First Out (LIFO) principle. 
          It has two main operations: push (adds an element to the top) and pop (removes the top element).
        </p>
        <p className="text-gray-700 mb-2">
          Stacks are used in many applications including function call management, expression evaluation, 
          and undo operations in text editors.
        </p>
        <p className="text-gray-700">
          Time complexity: Push, Pop and Peek operations all have O(1) time complexity.
        </p>
      </div>
    </div>
  );
};

export default StackViz;