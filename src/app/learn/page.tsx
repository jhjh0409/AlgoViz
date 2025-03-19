import Link from 'next/link';

export default function Learn() {
  const algorithms = [
    {
      name: 'Bubble Sort',
      description: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
      timeComplexity: {
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)'
      },
      spaceComplexity: 'O(1)',
      stable: true
    },
    {
      name: 'Selection Sort',
      description: 'An in-place comparison sorting algorithm that divides the input list into two parts: a sorted sublist and an unsorted sublist. It repeatedly finds the minimum element from the unsorted sublist and moves it to the end of the sorted sublist.',
      timeComplexity: {
        best: 'O(n²)',
        average: 'O(n²)',
        worst: 'O(n²)'
      },
      spaceComplexity: 'O(1)',
      stable: false
    },
    {
      name: 'Insertion Sort',
      description: 'A simple sorting algorithm that builds the final sorted array one item at a time. It is much less efficient on large lists than more advanced algorithms such as quicksort, heapsort, or merge sort.',
      timeComplexity: {
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)'
      },
      spaceComplexity: 'O(1)',
      stable: true
    },
    {
      name: 'Merge Sort',
      description: 'An efficient, divide-and-conquer sorting algorithm that divides the input array into two halves, recursively sorts them, and then merges the sorted halves.',
      timeComplexity: {
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n)'
      },
      spaceComplexity: 'O(n)',
      stable: true
    },
    {
      name: 'Quick Sort',
      description: 'An efficient, divide-and-conquer sorting algorithm that works by selecting a pivot element and partitioning the array around the pivot.',
      timeComplexity: {
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n²)'
      },
      spaceComplexity: 'O(log n)',
      stable: false
    },
    {
      name: 'Heap Sort',
      description: 'A comparison-based sorting algorithm that uses a binary heap data structure. It divides its input into a sorted and an unsorted region, and iteratively shrinks the unsorted region by extracting the largest element and moving it to the sorted region.',
      timeComplexity: {
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n)'
      },
      spaceComplexity: 'O(1)',
      stable: false
    },
    {
      name: 'Radix Sort',
      description: 'A non-comparative integer sorting algorithm that sorts data with integer keys by grouping keys by individual digits which share the same significant position and value.',
      timeComplexity: {
        best: 'O(nk)',
        average: 'O(nk)',
        worst: 'O(nk)'
      },
      spaceComplexity: 'O(n+k)',
      stable: true
    },
    {
      name: 'Counting Sort',
      description: 'An integer sorting algorithm that operates by counting the number of objects that have each distinct key value, and using arithmetic to determine the positions of each key value in the output sequence.',
      timeComplexity: {
        best: 'O(n+k)',
        average: 'O(n+k)',
        worst: 'O(n+k)'
      },
      spaceComplexity: 'O(k)',
      stable: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Learn About Sorting Algorithms</h1>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800">
            Back to Home
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-4">What are Sorting Algorithms?</h2>
          <p className="text-gray-700 mb-4">
            Sorting algorithms are a set of instructions that take an array or list as an input and arrange the items into a specific order. Sorts are commonly performed in alphabetical or numerical order and can be implemented in many different ways.
          </p>
          <p className="text-gray-700 mb-4">
            Different sorting algorithms have different characteristics and performance implications, making them suitable for different scenarios. Understanding these differences is crucial for choosing the right algorithm for a specific task.
          </p>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-medium text-indigo-700 mb-2">Key Metrics for Comparing Sorting Algorithms</h3>
            <ul className="list-disc pl-5 text-gray-700">
              <li><strong>Time Complexity:</strong> How the algorithm's performance scales with input size.</li>
              <li><strong>Space Complexity:</strong> How much additional memory the algorithm requires.</li>
              <li><strong>Stability:</strong> Whether the algorithm preserves the relative order of equal elements.</li>
              <li><strong>Adaptivity:</strong> How the algorithm performs on partially sorted arrays.</li>
            </ul>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {algorithms.map((algorithm, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-indigo-600 mb-3">{algorithm.name}</h2>
              <p className="text-gray-700 mb-4">{algorithm.description}</p>
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-800 mb-2">Time Complexity</h3>
                <ul className="text-sm text-gray-600">
                  <li><span className="inline-block w-20 font-medium">Best Case:</span> {algorithm.timeComplexity.best}</li>
                  <li><span className="inline-block w-20 font-medium">Average:</span> {algorithm.timeComplexity.average}</li>
                  <li><span className="inline-block w-20 font-medium">Worst Case:</span> {algorithm.timeComplexity.worst}</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-800 mb-2">Space Complexity</h3>
                <p className="text-sm text-gray-600">{algorithm.spaceComplexity}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Stability</h3>
                <p className="text-sm text-gray-600">{algorithm.stable ? 'Stable' : 'Not Stable'}</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link 
                  href={`/visualizer?algorithm=${algorithm.name.toLowerCase().replace(' ', '-')}`}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Visualize {algorithm.name} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
