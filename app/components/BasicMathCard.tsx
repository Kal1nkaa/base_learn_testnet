'use client'

import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { parseUnits } from 'viem'

const BASIC_MATH_ADDRESS = '0x2a50A417ee05D7527787C9f5ED7657CF9DaD3BFB' as const
const BASIC_MATH_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "_a", "type": "uint256"}, {"internalType": "uint256", "name": "_b", "type": "uint256"}],
    "name": "adder",
    "outputs": [{"internalType": "uint256", "name": "sum", "type": "uint256"}, {"internalType": "bool", "name": "error", "type": "bool"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_a", "type": "uint256"}, {"internalType": "uint256", "name": "_b", "type": "uint256"}],
    "name": "subtractor",
    "outputs": [{"internalType": "uint256", "name": "difference", "type": "uint256"}, {"internalType": "bool", "name": "error", "type": "bool"}],
    "stateMutability": "pure",
    "type": "function"
  }
] as const

export default function BasicMathCard() {
  const { isConnected } = useAccount()
  const [inputA, setInputA] = useState('')
  const [inputB, setInputB] = useState('')
  const [result, setResult] = useState<{ value: string; error: boolean; operation: string } | null>(null)
  const [operation, setOperation] = useState<'add' | 'subtract'>('add')
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = async () => {
    if (!inputA || !inputB || !isConnected) return

    setIsCalculating(true)
    try {
      const a = BigInt(inputA)
      const b = BigInt(inputB)
      
      // Call the smart contract function
      const contractResult = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: BASIC_MATH_ADDRESS,
          abi: BASIC_MATH_ABI,
          functionName: operation === 'add' ? 'adder' : 'subtractor',
          args: [a.toString(), b.toString()]
        })
      })
      
      const data = await contractResult.json()
      
      if (data.success) {
        const [value, error] = data.result
        setResult({ 
          value: value.toString(), 
          error: error, 
          operation: operation === 'add' ? 'Addition' : 'Subtraction'
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Contract call error:', error)
      setResult({ value: '0', error: true, operation: operation === 'add' ? 'Addition' : 'Subtraction' })
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">BasicMath Contract</h2>
        <div className="text-sm text-gray-500">
          <p>Contract: {BASIC_MATH_ADDRESS.slice(0, 6)}...{BASIC_MATH_ADDRESS.slice(-4)}</p>
          <p>Network: Base Sepolia</p>
        </div>
      </div>
      
      {!isConnected ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please connect your wallet to interact with this contract</p>
          <appkit-button />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value A</label>
              <input
                type="text"
                value={inputA}
                onChange={(e) => setInputA(e.target.value)}
                placeholder="Enter first number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isCalculating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value B</label>
              <input
                type="text"
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
                placeholder="Enter second number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isCalculating}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setOperation('add')}
              disabled={isCalculating}
              className={`p-3 rounded-lg font-medium transition-all ${
                operation === 'add'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${isCalculating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              ➕ Addition
            </button>
            <button
              onClick={() => setOperation('subtract')}
              disabled={isCalculating}
              className={`p-3 rounded-lg font-medium transition-all ${
                operation === 'subtract'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${isCalculating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              ➖ Subtraction
            </button>
          </div>

          <button
            onClick={handleCalculate}
            disabled={!inputA || !inputB || isCalculating}
            className="w-full p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {isCalculating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Calculating...</span>
              </div>
            ) : (
              `Calculate ${operation === 'add' ? 'Sum' : 'Difference'} on Contract`
            )}
          </button>

          {result && (
            <div className={`p-4 rounded-lg border-l-4 ${
              result.error 
                ? 'bg-red-50 border-red-400 text-red-700' 
                : 'bg-green-50 border-green-400 text-green-700'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">
                    {result.operation} Result: {result.value}
                  </p>
                  {result.error ? (
                    <p className="text-sm mt-1">
                      ⚠️ {operation === 'add' ? 'Overflow' : 'Underflow'} detected by smart contract
                    </p>
                  ) : (
                    <p className="text-sm mt-1">
                      ✅ Operation completed successfully on-chain
                    </p>
                  )}
                </div>
                <div className="text-2xl">
                  {result.error ? '❌' : '✅'}
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Contract Functions:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code>adder(uint _a, uint _b)</code> - Safe addition with overflow protection</li>
              <li>• <code>subtractor(uint _a, uint _b)</code> - Safe subtraction with underflow protection</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
