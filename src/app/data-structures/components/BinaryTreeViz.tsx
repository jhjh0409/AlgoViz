'use client';

import { useState, useRef, useEffect } from 'react';

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
  highlighted?: boolean;
}

const BinaryTreeViz = () => {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [traversalResult, setTraversalResult] = useState<number[]>([]);
  const [traversalType, setTraversalType] = useState<string>('inorder');
  const [animationInProgress, setAnimationInProgress] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize a sample tree
  useEffect(() => {
    const sampleTree: TreeNode = {
      value: 50,
      left: {
        value: 30,
        left: {
          value: 20,
          left: null,
          right: null
        },
        right: {
          value: 40,
          left: null,
          right: null
        }
      },
      right: {
        value: 70,
        left: {
          value: 60,
          left: null,
          right: null
        },
        right: {
          value: 80,
          left: null,
          right: null
        }
      }
    };
    
    setTree(sampleTree);
  }, []);
  
  // Calculate positions for tree nodes
  useEffect(() => {
    if (tree && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate positions
        const calculatePositions = (node: TreeNode | null, depth: number, position: number, maxDepth: number) => {
          if (!node) return;
          
          const horizontalSpacing = canvas.width / Math.pow(2, depth + 1);
          node.x = position * horizontalSpacing;
          node.y = (depth + 1) * 80;
          
          calculatePositions(node.left, depth + 1, position * 2 - 0.5, maxDepth);
          calculatePositions(node.right, depth + 1, position * 2 + 0.5, maxDepth);
        };
        
        const getMaxDepth = (node: TreeNode | null): number => {
          if (!node) return 0;
          return 1 + Math.max(getMaxDepth(node.left), getMaxDepth(node.right));
        };
        
        const maxDepth = getMaxDepth(tree);
        calculatePositions(tree, 0, 1, maxDepth);
        
        // Draw the tree
        drawTree(ctx, tree);
      }
    }
  }, [tree]);
  
  // Draw the tree on canvas
  const drawTree = (ctx: CanvasRenderingContext2D, node: TreeNode | null) => {
    if (!node) return;
    
    // Draw connections to children
    if (node.left) {
      ctx.beginPath();
      ctx.moveTo(node.x!, node.y!);
      ctx.lineTo(node.left.x!, node.left.y!);
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    if (node.right) {
      ctx.beginPath();
      ctx.moveTo(node.x!, node.y!);
      ctx.lineTo(node.right.x!, node.right.y!);
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw node
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, 25, 0, 2 * Math.PI);
    ctx.fillStyle = node.highlighted ? '#4F46E5' : '#EEF2FF';
    ctx.fill();
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw value
    ctx.font = '16px Arial';
    ctx.fillStyle = node.highlighted ? '#FFFFFF' : '#4F46E5';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.value.toString(), node.x!, node.y!);
    
    // Draw children
    drawTree(ctx, node.left);
    drawTree(ctx, node.right);
  };
  
  // Insert a new value into the tree
  const insertValue = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;
    
    const insert = (node: TreeNode | null, value: number): TreeNode => {
      if (!node) {
        return { value, left: null, right: null };
      }
      
      if (value < node.value) {
        node.left = insert(node.left, value);
      } else if (value > node.value) {
        node.right = insert(node.right, value);
      }
      
      return node;
    };
    
    const newTree = tree ? { ...tree } : null;
    const updatedTree = newTree ? insert(newTree, value) : { value, left: null, right: null };
    setTree(updatedTree);
    setInputValue('');
  };
  
  // Perform tree traversal
  const traverseTree = async () => {
    if (!tree) return;
    
    setAnimationInProgress(true);
    setTraversalResult([]);
    
    const result: number[] = [];
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    const resetHighlights = (node: TreeNode | null) => {
      if (!node) return;
      node.highlighted = false;
      resetHighlights(node.left);
      resetHighlights(node.right);
    };
    
    const inorderTraversal = async (node: TreeNode | null) => {
      if (!node) return;
      
      await inorderTraversal(node.left);
      
      node.highlighted = true;
      setTree({ ...tree });
      result.push(node.value);
      setTraversalResult([...result]);
      await delay(500);
      
      await inorderTraversal(node.right);
    };
    
    const preorderTraversal = async (node: TreeNode | null) => {
      if (!node) return;
      
      node.highlighted = true;
      setTree({ ...tree });
      result.push(node.value);
      setTraversalResult([...result]);
      await delay(500);
      
      await preorderTraversal(node.left);
      await preorderTraversal(node.right);
    };
    
    const postorderTraversal = async (node: TreeNode | null) => {
      if (!node) return;
      
      await postorderTraversal(node.left);
      await postorderTraversal(node.right);
      
      node.highlighted = true;
      setTree({ ...tree });
      result.push(node.value);
      setTraversalResult([...result]);
      await delay(500);
    };
    
    const bfsTraversal = async (root: TreeNode) => {
      const queue: TreeNode[] = [root];
      
      while (queue.length > 0) {
        const node = queue.shift()!;
        
        node.highlighted = true;
        setTree({ ...tree });
        result.push(node.value);
        setTraversalResult([...result]);
        await delay(500);
        
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
      }
    };
    
    resetHighlights(tree);
    
    if (traversalType === 'inorder') {
      await inorderTraversal(tree);
    } else if (traversalType === 'preorder') {
      await preorderTraversal(tree);
    } else if (traversalType === 'postorder') {
      await postorderTraversal(tree);
    } else if (traversalType === 'bfs') {
      await bfsTraversal(tree);
    }
    
    resetHighlights(tree);
    setTree({ ...tree });
    setAnimationInProgress(false);
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Binary Tree Visualization</h2>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-lg mb-2">Operations</h3>
          
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
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Traversal Type</label>
            <select
              value={traversalType}
              onChange={(e) => setTraversalType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={animationInProgress}
            >
              <option value="inorder">In-order (LNR)</option>
              <option value="preorder">Pre-order (NLR)</option>
              <option value="postorder">Post-order (LRN)</option>
              <option value="bfs">Breadth-First Search</option>
            </select>
          </div>
          
          <button
            onClick={traverseTree}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 w-full"
            disabled={animationInProgress}
          >
            {animationInProgress ? 'Traversing...' : 'Start Traversal'}
          </button>
        </div>
        
        <div>
          <h3 className="font-medium text-lg mb-2">Traversal Result</h3>
          <div className="p-4 bg-gray-100 rounded-md min-h-[100px]">
            {traversalResult.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {traversalResult.map((value, index) => (
                  <div key={index} className="bg-indigo-600 text-white px-3 py-1 rounded-md">
                    {value}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No traversal performed yet</p>
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
        <h3 className="font-medium text-lg mb-2">About Binary Trees</h3>
        <p className="text-gray-700 mb-2">
          A binary tree is a tree data structure in which each node has at most two children, referred to as the left child and the right child.
        </p>
        <p className="text-gray-700">
          Common operations include insertion, deletion, and various traversal methods like in-order, pre-order, post-order, and breadth-first search.
        </p>
      </div>
    </div>
  );
};

export default BinaryTreeViz;
