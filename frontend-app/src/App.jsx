import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* ĐÂY LÀ NƠI DÁN CODE HTML/REACT */}
      <h1 className="text-3xl font-bold underline text-blue-600 mb-4">
        Hello SmartMatch!
      </h1>
      
      <button 
        onClick={() => setCount((count) => count + 1)}
        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
      >
        Count is {count}
      </button>
    </div>
  )
}

export default App