import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-6xl font-bold text-indigo-600 mb-6">
          AlgoViz
        </h1>
        <p className="text-xl text-gray-700 mb-12">
          Visualize and understand sorting algorithms with interactive animations
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Visualize Algorithms</h2>
            <p className="text-gray-600 mb-6">
              Watch how different sorting algorithms work in real-time with customizable array sizes and speeds.
            </p>
            <Link 
              href="/visualizer" 
              className="inline-block bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Start Visualizing
            </Link>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Learn How They Work</h2>
            <p className="text-gray-600 mb-6">
              Understand the mechanics behind popular sorting algorithms and compare their performance.
            </p>
            <Link 
              href="/learn" 
              className="inline-block bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
        
        <div className="bg-indigo-800 text-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Available Algorithms</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort', 'Heap Sort', 'Radix Sort', 'Counting Sort'].map((algo) => (
              <div key={algo} className="bg-indigo-700 p-3 rounded-lg">
                {algo}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <footer className="mt-16 text-center text-gray-600">
        <p>© {new Date().getFullYear()} AlgoViz - Sorting Algorithm Visualization</p>
      </footer>
    </main>
  );
}
