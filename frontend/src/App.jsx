import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex justify-center items-center gap-8 mt-8">
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="logo w-24 h-24 transition-transform hover:scale-110" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="logo react w-24 h-24 transition-transform hover:scale-110" alt="React logo" />
        </a>
      </div>
      <h1 className="text-4xl font-bold text-center mt-6 text-green-600">Vite + React</h1>
      <div className="card bg-white rounded-lg shadow-md p-8 mt-6 mx-auto max-w-md flex flex-col items-center">
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition-colors mb-4"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>
        <p className="text-gray-600">
          Edit <code className="bg-gray-100 px-1 rounded">src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs text-center mt-8 text-gray-500">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
