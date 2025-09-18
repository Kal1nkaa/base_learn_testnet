'use client'

import { useState } from 'react'

export default function BasicMathCard() {
  const [inputA, setInputA] = useState('')
  const [inputB, setInputB] = useState('')
  const [result, setResult] = useState<{ value: string; error: boolean } | null>(null)
  const [operation, setOperation] = useState<'add' | 'subtract'>('add')

  const handleCalculate = async () => {
    if (!inputA || !inputB) return

    try {
      // This is a placeholder for the actual contract interaction
      // You'll need to implement the actual contract calls once deployed
      if (operation === 'add') {
        const a = BigInt(inputA)
        const b = BigInt(inputB)
        try {
          const sum = a + b
          setResult({ value: sum.toString(), error: false })
        } catch {
          setResult({ value: '0', error: true })
        }
      } else {
        const a = BigInt(inputA)
        const b = BigInt(inputB)
        if (b > a) {
          setResult({ value: '0', error: true })
        } else {
          setResult({ value: (a - b).toString(), error: false })
        }
      }
    } catch (error) {
      console.error('Calculation error:', error)
      setResult({ value: '0', error: true })
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Basic Math Operations</h2>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            placeholder="Enter value A"
            className="flex-1 p-2 border rounded"
          />
          <input
            type="text"
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
            placeholder="Enter value B"
            className="flex-1 p-2 border rounded"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setOperation('add')}
            className={`flex-1 p-2 rounded ${
              operation === 'add'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Add
          </button>
          <button
            onClick={() => setOperation('subtract')}
            className={`flex-1 p-2 rounded ${
              operation === 'subtract'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Subtract
          </button>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Calculate
        </button>

        {result && (
          <div className={`mt-4 p-4 rounded ${
            result.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            <p className="font-semibold">
              Result: {result.value}
            </p>
            {result.error && (
              <p className="text-sm mt-1">
                {operation === 'add' ? 'Overflow' : 'Underflow'} occurred
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
