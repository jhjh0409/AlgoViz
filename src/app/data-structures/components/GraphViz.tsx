'use client';

import { useState, useRef, useEffect } from 'react';

// Types for graph data structures
interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  highlighted?: boolean;
  visited?: boolean;
  distance?: number;
  predecessor?: string | undefined;
}

interface Edge {
  source: string;
  target: string;
  weight: number;
  directed: boolean;
  highlighted?: boolean;
}

interface Graph {
  nodes: Node[];
  edges: Edge[];
  isDirected: boolean;
  isWeighted: boolean;
}

const GraphViz = () => {
  // Canvas dimensions
  const canvasWidth = 600;
  const canvasHeight = 400;
  const nodeRadius = 20;
  
  // Graph state
  const [graph, setGraph] = useState<Graph>({
    nodes: [],
    edges: [],
    isDirected: false,
    isWeighted: false
  });
  
  // UI state
  const [nodeIdCounter, setNodeIdCounter] = useState<number>(1);
  const [nodeInput, setNodeInput] = useState<string>('');
  const [sourceNode, setSourceNode] = useState<string>('');
  const [targetNode, setTargetNode] = useState<string>('');
  const [edgeWeight, setEdgeWeight] = useState<string>('1');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('dfs');
  const [startNode, setStartNode] = useState<string>('');
  const [endNode, setEndNode] = useState<string>('');
  const [animationSpeed, setAnimationSpeed] = useState<number>(500);
  const [animationInProgress, setAnimationInProgress] = useState<boolean>(false);
  const [operationLog, setOperationLog] = useState<string[]>([]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  
  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw the graph on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw edges
    graph.edges.forEach(edge => {
      const sourceNode = graph.nodes.find(node => node.id === edge.source);
      const targetNode = graph.nodes.find(node => node.id === edge.target);
      
      if (sourceNode && targetNode) {
        drawEdge(ctx, sourceNode, targetNode, edge);
      }
    });
    
    // Draw nodes
    graph.nodes.forEach(node => {
      drawNode(ctx, node);
    });
  }, [graph]);
  
  // Draw a node on the canvas
  const drawNode = (ctx: CanvasRenderingContext2D, node: Node) => {
    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
    
    // Fill based on node state
    if (node.highlighted) {
      ctx.fillStyle = '#4F46E5'; // Indigo for highlighted nodes
    } else if (node.visited) {
      ctx.fillStyle = '#10B981'; // Green for visited nodes
    } else {
      ctx.fillStyle = '#60A5FA'; // Blue for normal nodes
    }
    
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1E40AF';
    ctx.stroke();
    
    // Node label
    ctx.font = '14px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y);
    
    // Distance label (for Dijkstra's)
    if (node.distance !== undefined && node.distance !== Infinity) {
      ctx.font = '12px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText(node.distance.toString(), node.x, node.y - nodeRadius - 5);
    }
  };
  
  // Draw an edge on the canvas
  const drawEdge = (ctx: CanvasRenderingContext2D, source: Node, target: Node, edge: Edge) => {
    // Calculate direction vector
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize direction vector
    const unitDx = dx / length;
    const unitDy = dy / length;
    
    // Calculate start and end points (adjusted for node radius)
    const startX = source.x + unitDx * nodeRadius;
    const startY = source.y + unitDy * nodeRadius;
    const endX = target.x - unitDx * nodeRadius;
    const endY = target.y - unitDy * nodeRadius;
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    
    // Edge style based on state
    ctx.lineWidth = 2;
    if (edge.highlighted) {
      ctx.strokeStyle = '#4F46E5'; // Indigo for highlighted edges
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = '#6B7280'; // Gray for normal edges
    }
    
    ctx.stroke();
    
    // Draw arrow for directed graphs
    if (graph.isDirected || edge.directed) {
      drawArrow(ctx, endX, endY, unitDx, unitDy);
    }
    
    // Draw weight for weighted graphs
    if (graph.isWeighted) {
      // Position weight label at the middle of the edge
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      
      // Add a small white background for better readability
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(midX, midY, 10, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw weight text
      ctx.font = '12px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(edge.weight.toString(), midX, midY);
    }
  };
  
  // Draw an arrow head
  const drawArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number) => {
    const arrowSize = 10;
    const angle = Math.atan2(dy, dx);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x - arrowSize * Math.cos(angle - Math.PI / 6),
      y - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      x - arrowSize * Math.cos(angle + Math.PI / 6),
      y - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  };
  
  // Handle canvas click for node placement
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (animationInProgress) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicked on an existing node
    const clickedNode = graph.nodes.find(node => 
      Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2)) <= nodeRadius
    );
    
    if (clickedNode) {
      // Select node for edge creation
      if (!sourceNode) {
        setSourceNode(clickedNode.id);
        setOperationLog([`Selected ${clickedNode.label} as source node`]);
      } else if (!targetNode && sourceNode !== clickedNode.id) {
        setTargetNode(clickedNode.id);
        setOperationLog([`Selected ${clickedNode.label} as target node`]);
      } else {
        // Deselect nodes
        setSourceNode('');
        setTargetNode('');
        setOperationLog([`Deselected nodes`]);
      }
    } else if (nodeInput) {
      // Add new node
      const newNode: Node = {
        id: `node${nodeIdCounter}`,
        x,
        y,
        label: nodeInput
      };
      
      setGraph(prev => ({
        ...prev,
        nodes: [...prev.nodes, newNode]
      }));
      
      setNodeIdCounter(prev => prev + 1);
      setNodeInput('');
      setOperationLog([`Added node ${newNode.label}`]);
    }
  };
  
  // Handle mouse down for node dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (animationInProgress) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if mouse down on a node
    const clickedNode = graph.nodes.find(node => 
      Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2)) <= nodeRadius
    );
    
    if (clickedNode) {
      setDraggedNode(clickedNode.id);
    }
  };
  
  // Handle mouse move for node dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedNode || animationInProgress) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update node position
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === draggedNode 
          ? { ...node, x, y } 
          : node
      )
    }));
  };
  
  // Handle mouse up to end node dragging
  const handleMouseUp = () => {
    setDraggedNode(null);
  };
  
  // Add an edge between selected nodes
  const addEdge = () => {
    if (!sourceNode || !targetNode) return;
    
    const weight = parseInt(edgeWeight);
    if (isNaN(weight)) return;
    
    // Check if edge already exists
    const edgeExists = graph.edges.some(edge => 
      edge.source === sourceNode && edge.target === targetNode
    );
    
    if (edgeExists) {
      setOperationLog([`Edge already exists between these nodes`]);
      return;
    }
    
    const newEdge: Edge = {
      source: sourceNode,
      target: targetNode,
      weight,
      directed: graph.isDirected
    };
    
    setGraph(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge]
    }));
    
    const sourceLabel = graph.nodes.find(node => node.id === sourceNode)?.label;
    const targetLabel = graph.nodes.find(node => node.id === targetNode)?.label;
    
    setOperationLog([`Added edge from ${sourceLabel} to ${targetLabel} with weight ${weight}`]);
    
    // Reset selection
    setSourceNode('');
    setTargetNode('');
    setEdgeWeight('1');
  };
  
  // Delete selected node
  const deleteNode = () => {
    if (!sourceNode) return;
    
    // Remove node and all connected edges
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== sourceNode),
      edges: prev.edges.filter(edge => 
        edge.source !== sourceNode && edge.target !== sourceNode
      )
    }));
    
    const nodeLabel = graph.nodes.find(node => node.id === sourceNode)?.label;
    setOperationLog([`Deleted node ${nodeLabel} and all connected edges`]);
    
    // Reset selection
    setSourceNode('');
    setTargetNode('');
  };
  
  // Delete selected edge
  const deleteEdge = () => {
    if (!sourceNode || !targetNode) return;
    
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.filter(edge => 
        !(edge.source === sourceNode && edge.target === targetNode)
      )
    }));
    
    const sourceLabel = graph.nodes.find(node => node.id === sourceNode)?.label;
    const targetLabel = graph.nodes.find(node => node.id === targetNode)?.label;
    
    setOperationLog([`Deleted edge from ${sourceLabel} to ${targetLabel}`]);
    
    // Reset selection
    setSourceNode('');
    setTargetNode('');
  };
  
  // Toggle directed/undirected graph
  const toggleDirected = () => {
    setGraph(prev => ({
      ...prev,
      isDirected: !prev.isDirected
    }));
    
    setOperationLog([`Graph is now ${!graph.isDirected ? 'directed' : 'undirected'}`]);
  };
  
  // Toggle weighted/unweighted graph
  const toggleWeighted = () => {
    setGraph(prev => ({
      ...prev,
      isWeighted: !prev.isWeighted
    }));
    
    setOperationLog([`Graph is now ${!graph.isWeighted ? 'weighted' : 'unweighted'}`]);
  };
  
  // Clear the graph
  const clearGraph = () => {
    setGraph({
      nodes: [],
      edges: [],
      isDirected: graph.isDirected,
      isWeighted: graph.isWeighted
    });
    
    setSourceNode('');
    setTargetNode('');
    setNodeIdCounter(1);
    setOperationLog([`Graph cleared`]);
  };
  
  // Add a sample graph
  const addSampleGraph = () => {
    // Create a sample graph with 6 nodes and multiple edges
    const sampleNodes: Node[] = [
      { id: 'node1', x: 100, y: 100, label: 'A' },
      { id: 'node2', x: 250, y: 50, label: 'B' },
      { id: 'node3', x: 400, y: 100, label: 'C' },
      { id: 'node4', x: 100, y: 250, label: 'D' },
      { id: 'node5', x: 250, y: 300, label: 'E' },
      { id: 'node6', x: 400, y: 250, label: 'F' }
    ];
    
    const sampleEdges: Edge[] = [
      { source: 'node1', target: 'node2', weight: 4, directed: graph.isDirected },
      { source: 'node1', target: 'node4', weight: 2, directed: graph.isDirected },
      { source: 'node2', target: 'node3', weight: 3, directed: graph.isDirected },
      { source: 'node2', target: 'node5', weight: 5, directed: graph.isDirected },
      { source: 'node3', target: 'node6', weight: 1, directed: graph.isDirected },
      { source: 'node4', target: 'node5', weight: 6, directed: graph.isDirected },
      { source: 'node5', target: 'node6', weight: 7, directed: graph.isDirected }
    ];
    
    setGraph({
      nodes: sampleNodes,
      edges: sampleEdges,
      isDirected: graph.isDirected,
      isWeighted: graph.isWeighted
    });
    
    setNodeIdCounter(7);
    setOperationLog([`Added sample graph with 6 nodes and 7 edges`]);
  };
  
  // Helper to reset node states
  const resetNodeStates = () => {
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => ({
        ...node,
        highlighted: false,
        visited: false,
        distance: undefined,
        predecessor: undefined
      })),
      edges: prev.edges.map(edge => ({
        ...edge,
        highlighted: false
      }))
    }));
  };
  
  // Get adjacent nodes for a given node
  const getAdjacentNodes = (nodeId: string): string[] => {
    const adjacentNodes: string[] = [];
    
    graph.edges.forEach(edge => {
      if (edge.source === nodeId) {
        adjacentNodes.push(edge.target);
      } else if (!graph.isDirected && edge.target === nodeId) {
        adjacentNodes.push(edge.source);
      }
    });
    
    return adjacentNodes;
  };
  
  // Depth-First Search algorithm
  const runDFS = async () => {
    if (!startNode || animationInProgress) return;
    
    setAnimationInProgress(true);
    resetNodeStates();
    setOperationLog([`Starting DFS from node ${graph.nodes.find(node => node.id === startNode)?.label}`]);
    
    // Create a set to track visited nodes
    const visited = new Set<string>();
    
    // DFS helper function
    const dfs = async (nodeId: string) => {
      // Mark node as visited
      visited.add(nodeId);
      
      // Update node state
      setGraph(prev => ({
        ...prev,
        nodes: prev.nodes.map(node => 
          node.id === nodeId 
            ? { ...node, highlighted: true, visited: true } 
            : node
        )
      }));
      
      setOperationLog(prev => [...prev, `Visiting node ${graph.nodes.find(node => node.id === nodeId)?.label}`]);
      
      // Pause for visualization
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      
      // Get adjacent nodes
      const adjacentNodes = getAdjacentNodes(nodeId);
      
      // Visit unvisited adjacent nodes
      for (const adjNodeId of adjacentNodes) {
        if (!visited.has(adjNodeId)) {
          // Highlight the edge
          setGraph(prev => ({
            ...prev,
            edges: prev.edges.map(edge => 
              (edge.source === nodeId && edge.target === adjNodeId) ||
              (!graph.isDirected && edge.source === adjNodeId && edge.target === nodeId)
                ? { ...edge, highlighted: true }
                : edge
            )
          }));
          
          await new Promise(resolve => setTimeout(resolve, animationSpeed / 2));
          
          // Recursively visit adjacent node
          await dfs(adjNodeId);
        }
      }
      
      // Un-highlight current node (but keep it as visited)
      setGraph(prev => ({
        ...prev,
        nodes: prev.nodes.map(node => 
          node.id === nodeId 
            ? { ...node, highlighted: false, visited: true } 
            : node
        )
      }));
    };
    
    // Start DFS from the selected node
    await dfs(startNode);
    
    setOperationLog(prev => [...prev, `DFS traversal complete`]);
    setAnimationInProgress(false);
  };
  
  // Breadth-First Search algorithm
  const runBFS = async () => {
    if (!startNode || animationInProgress) return;
    
    setAnimationInProgress(true);
    resetNodeStates();
    setOperationLog([`Starting BFS from node ${graph.nodes.find(node => node.id === startNode)?.label}`]);
    
    // Create a queue for BFS
    const queue: string[] = [startNode];
    const visited = new Set<string>([startNode]);
    
    // Mark start node as visited
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === startNode 
          ? { ...node, highlighted: true, visited: true } 
          : node
      )
    }));
    
    await new Promise(resolve => setTimeout(resolve, animationSpeed));
    
    // BFS traversal
    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      
      setOperationLog(prev => [...prev, `Visiting node ${graph.nodes.find(node => node.id === currentNodeId)?.label}`]);
      
      // Get adjacent nodes
      const adjacentNodes = getAdjacentNodes(currentNodeId);
      
      // Visit unvisited adjacent nodes
      for (const adjNodeId of adjacentNodes) {
        if (!visited.has(adjNodeId)) {
          // Mark as visited and add to queue
          visited.add(adjNodeId);
          queue.push(adjNodeId);
          
          // Highlight the edge
          setGraph(prev => ({
            ...prev,
            edges: prev.edges.map(edge => 
              (edge.source === currentNodeId && edge.target === adjNodeId) ||
              (!graph.isDirected && edge.source === adjNodeId && edge.target === currentNodeId)
                ? { ...edge, highlighted: true }
                : edge
            )
          }));
          
          await new Promise(resolve => setTimeout(resolve, animationSpeed / 2));
          
          // Highlight the adjacent node
          setGraph(prev => ({
            ...prev,
            nodes: prev.nodes.map(node => 
              node.id === adjNodeId 
                ? { ...node, highlighted: true, visited: true } 
                : node
            )
          }));
          
          await new Promise(resolve => setTimeout(resolve, animationSpeed / 2));
        }
      }
      
      // Un-highlight current node (but keep it as visited)
      setGraph(prev => ({
        ...prev,
        nodes: prev.nodes.map(node => 
          node.id === currentNodeId 
            ? { ...node, highlighted: false, visited: true } 
            : node
        )
      }));
    }
    
    setOperationLog(prev => [...prev, `BFS traversal complete`]);
    setAnimationInProgress(false);
  };
  
  // Dijkstra's algorithm for shortest path
  const runDijkstra = async () => {
    if (!startNode || !endNode || animationInProgress || !graph.isWeighted) return;
    
    setAnimationInProgress(true);
    resetNodeStates();
    setOperationLog([
      `Starting Dijkstra's algorithm from ${graph.nodes.find(node => node.id === startNode)?.label} to ${graph.nodes.find(node => node.id === endNode)?.label}`
    ]);
    
    // Initialize distances
    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: string | undefined } = {};
    const unvisited: Set<string> = new Set();
    
    // Set initial distances
    graph.nodes.forEach(node => {
      distances[node.id] = node.id === startNode ? 0 : Infinity;
      previous[node.id] = undefined;
      unvisited.add(node.id);
    });
    
    // Update graph with initial distances
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => ({
        ...node,
        distance: distances[node.id],
        highlighted: node.id === startNode
      }))
    }));
    
    await new Promise(resolve => setTimeout(resolve, animationSpeed));
    
    // Main Dijkstra loop
    while (unvisited.size > 0) {
      // Find node with minimum distance
      let minDistance = Infinity;
      let minNodeId: string | null = null;
      
      unvisited.forEach(nodeId => {
        if (distances[nodeId] < minDistance) {
          minDistance = distances[nodeId];
          minNodeId = nodeId;
        }
      });
      
      // If we can't reach any more nodes or we've reached the end node
      if (minNodeId === null || minDistance === Infinity || minNodeId === endNode) {
        break;
      }
      
      // Remove from unvisited
      unvisited.delete(minNodeId);
      
      // Highlight current node
      setGraph(prev => ({
        ...prev,
        nodes: prev.nodes.map(node => 
          node.id === minNodeId 
            ? { ...node, highlighted: true, visited: true } 
            : { ...node, highlighted: false }
        )
      }));
      
      setOperationLog(prev => [...prev, `Visiting node ${graph.nodes.find(node => node.id === minNodeId)?.label} with distance ${minDistance}`]);
      
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      
      // Get adjacent nodes
      const adjacentNodes = getAdjacentNodes(minNodeId);
      
      // Update distances to adjacent nodes
      for (const adjNodeId of adjacentNodes) {
        if (!unvisited.has(adjNodeId)) continue;
        
        // Find edge weight
        const edge = graph.edges.find(e => 
          (e.source === minNodeId && e.target === adjNodeId) ||
          (!graph.isDirected && e.source === adjNodeId && e.target === minNodeId)
        );
        
        if (!edge) continue;
        
        // Highlight the edge being considered
        setGraph(prev => ({
          ...prev,
          edges: prev.edges.map(e => 
            e === edge ? { ...e, highlighted: true } : { ...e, highlighted: false }
          )
        }));
        
        await new Promise(resolve => setTimeout(resolve, animationSpeed / 2));
        
        // Calculate new distance
        const newDistance = distances[minNodeId] + edge.weight;
        
        // If new distance is shorter, update
        if (newDistance < distances[adjNodeId]) {
          distances[adjNodeId] = newDistance;
          previous[adjNodeId] = minNodeId;
          
          // Update node distance
          setGraph(prev => ({
            ...prev,
            nodes: prev.nodes.map(node => 
              node.id === adjNodeId 
                ? { ...node, distance: newDistance as number, predecessor: minNodeId } 
                : node
            )
          }));
          
          setOperationLog(prev => [...prev, `Updated distance to ${graph.nodes.find(node => node.id === adjNodeId)?.label}: ${newDistance}`]);
          
          await new Promise(resolve => setTimeout(resolve, animationSpeed / 2));
        }
      }
    }
    
    // If end node is reachable, highlight the shortest path
    if (distances[endNode] !== Infinity) {
      setOperationLog(prev => [...prev, `Shortest path found with distance ${distances[endNode]}`]);
      
      // Reconstruct path
      const path: string[] = [];
      let current: string | undefined = endNode;
      
      while (current) {
        path.unshift(current);
        current = previous[current];
      }
      
      // Highlight the path
      for (let i = 0; i < path.length - 1; i++) {
        const sourceId = path[i];
        const targetId = path[i + 1];
        
        // Highlight node
        setGraph(prev => ({
          ...prev,
          nodes: prev.nodes.map(node => 
            node.id === sourceId 
              ? { ...node, highlighted: true } 
              : node
          )
        }));
        
        // Highlight edge
        setGraph(prev => ({
          ...prev,
          edges: prev.edges.map(edge => 
            (edge.source === sourceId && edge.target === targetId) ||
            (!graph.isDirected && edge.source === targetId && edge.target === sourceId)
              ? { ...edge, highlighted: true }
              : edge
          )
        }));
        
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
      }
      
      // Highlight the end node
      setGraph(prev => ({
        ...prev,
        nodes: prev.nodes.map(node => 
          node.id === endNode 
            ? { ...node, highlighted: true } 
            : node
        )
      }));
    } else {
      setOperationLog(prev => [...prev, `No path found to ${graph.nodes.find(node => node.id === endNode)?.label}`]);
    }
    
    setOperationLog(prev => [...prev, `Dijkstra's algorithm complete`]);
    setAnimationInProgress(false);
  };
  
  // Run the selected algorithm
  const runAlgorithm = () => {
    switch (selectedAlgorithm) {
      case 'dfs':
        runDFS();
        break;
      case 'bfs':
        runBFS();
        break;
      case 'dijkstra':
        runDijkstra();
        break;
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Graph Visualization</h2>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <h3 className="font-medium text-lg mb-2">Graph Controls</h3>
            
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={nodeInput}
                onChange={(e) => setNodeInput(e.target.value)}
                placeholder="Node Label"
                className="p-2 border border-gray-300 rounded-md mr-2 flex-grow"
                disabled={animationInProgress}
              />
              <button
                onClick={() => setNodeInput('')}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300"
                disabled={animationInProgress || !nodeInput}
              >
                Clear
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              {nodeInput ? `Click on the canvas to add node "${nodeInput}"` : 'Enter a label and click on the canvas to add a node'}
            </p>
            
            <div className="flex items-center mb-2">
              <div className="mr-2 flex-grow">
                <span className="text-sm font-medium">Source: </span>
                <span className="text-sm">
                  {sourceNode ? graph.nodes.find(node => node.id === sourceNode)?.label || 'None' : 'None'}
                </span>
              </div>
              <div className="flex-grow">
                <span className="text-sm font-medium">Target: </span>
                <span className="text-sm">
                  {targetNode ? graph.nodes.find(node => node.id === targetNode)?.label || 'None' : 'None'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={edgeWeight}
                onChange={(e) => setEdgeWeight(e.target.value)}
                placeholder="Weight"
                className="p-2 border border-gray-300 rounded-md mr-2 w-20"
                disabled={animationInProgress || !graph.isWeighted}
              />
              <button
                onClick={addEdge}
                className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 mr-2"
                disabled={animationInProgress || !sourceNode || !targetNode}
              >
                Add Edge
              </button>
              <button
                onClick={deleteEdge}
                className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700"
                disabled={animationInProgress || !sourceNode || !targetNode}
              >
                Delete Edge
              </button>
            </div>
            
            <div className="flex items-center mb-2">
              <button
                onClick={deleteNode}
                className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 mr-2"
                disabled={animationInProgress || !sourceNode}
              >
                Delete Node
              </button>
              <button
                onClick={clearGraph}
                className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 mr-2"
                disabled={animationInProgress}
              >
                Clear Graph
              </button>
              <button
                onClick={addSampleGraph}
                className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700"
                disabled={animationInProgress}
              >
                Sample Graph
              </button>
            </div>
            
            <div className="flex items-center mb-2">
              <button
                onClick={toggleDirected}
                className={`px-3 py-2 rounded-md mr-2 ${
                  graph.isDirected 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={animationInProgress}
              >
                {graph.isDirected ? 'Directed' : 'Undirected'}
              </button>
              <button
                onClick={toggleWeighted}
                className={`px-3 py-2 rounded-md ${
                  graph.isWeighted 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={animationInProgress}
              >
                {graph.isWeighted ? 'Weighted' : 'Unweighted'}
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
        
        <div>
          <h3 className="font-medium text-lg mb-2">Graph Visualization</h3>
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="bg-white"
            />
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium text-lg mb-2">Graph Algorithms</h3>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <select
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
                disabled={animationInProgress}
              >
                <option value="dfs">Depth-First Search (DFS)</option>
                <option value="bfs">Breadth-First Search (BFS)</option>
                <option value="dijkstra">Dijkstra's Algorithm</option>
              </select>
              <select
                value={startNode}
                onChange={(e) => setStartNode(e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
                disabled={animationInProgress}
              >
                <option value="">Select Start Node</option>
                {graph.nodes.map(node => (
                  <option key={node.id} value={node.id}>{node.label}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              {selectedAlgorithm === 'dijkstra' && (
                <select
                  value={endNode}
                  onChange={(e) => setEndNode(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md"
                  disabled={animationInProgress}
                >
                  <option value="">Select End Node</option>
                  {graph.nodes.map(node => (
                    <option key={node.id} value={node.id}>{node.label}</option>
                  ))}
                </select>
              )}
              <div className="flex items-center">
                <label className="text-sm mr-2">Speed:</label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="100"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                  className="flex-grow"
                  disabled={animationInProgress}
                />
              </div>
            </div>
            
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 w-full"
              disabled={animationInProgress || !startNode || (selectedAlgorithm === 'dijkstra' && !endNode)}
              onClick={runAlgorithm}
            >
              Run Algorithm
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-50 p-4 rounded-md">
        <h3 className="font-medium text-lg mb-2">About Graph Algorithms</h3>
        <p className="text-gray-700 mb-2">
          <strong>Depth-First Search (DFS):</strong> Explores as far as possible along each branch before backtracking. Uses a stack data structure.
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Breadth-First Search (BFS):</strong> Explores all neighbors at the present depth before moving to nodes at the next depth level. Uses a queue data structure.
        </p>
        <p className="text-gray-700">
          <strong>Dijkstra's Algorithm:</strong> Finds the shortest path between nodes in a graph. Works for weighted graphs with non-negative edge weights.
        </p>
      </div>
    </div>
  );
};

export default GraphViz;
