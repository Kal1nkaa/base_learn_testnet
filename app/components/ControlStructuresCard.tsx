'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

const CONTROL_STRUCTURES_ADDRESS = '0xaB6B6c13Fd72A92D27096d779F8188F85F4bb5Be' as const
const CONTROL_STRUCTURES_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "_number", "type": "uint256"}],
    "name": "fizzBuzz",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_time", "type": "uint256"}],
    "name": "doNotDisturb",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "pure",
    "type": "function"
  }
] as const

export default function ControlStructuresCard() {
  const { isConnected } = useAccount()
  const [fizzBuzzInput, setFizzBuzzInput] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [fizzBuzzResult, setFizzBuzzResult] = useState<string | null>(null)
  const [doNotDisturbResult, setDoNotDisturbResult] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState<'fizzbuzz' | 'time' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFizzBuzz = async () => {
    if (!fizzBuzzInput || !isConnected) return

    setIsCalculating('fizzbuzz')
    setError(null)
    try {
      const number = BigInt(fizzBuzzInput)
      
      const contractResult = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: CONTROL_STRUCTURES_ADDRESS,
          abi: CONTROL_STRUCTURES_ABI,
          functionName: 'fizzBuzz',
          args: [number.toString()]
        })
      })
      
      const data = await contractResult.json()
      
      if (data.success) {
        setFizzBuzzResult(data.result)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('FizzBuzz error:', error)
      setError('Failed to call FizzBuzz function')
    } finally {
      setIsCalculating(null)
    }
  }

  const handleDoNotDisturb = async () => {
    if (!timeInput || !isConnected) return

    setIsCalculating('time')
    setError(null)
    try {
      const time = BigInt(timeInput)
      
      const contractResult = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: CONTROL_STRUCTURES_ADDRESS,
          abi: CONTROL_STRUCTURES_ABI,
          functionName: 'doNotDisturb',
          args: [time.toString()]
        })
      })
      
      const data = await contractResult.json()
      
      if (data.success) {
        setDoNotDisturbResult(data.result)
      } else {
        // Handle expected errors from the contract
        if (data.error.includes('AfterHours')) {
          setDoNotDisturbResult(`❌ After Hours (Time: ${timeInput})`)
        } else if (data.error.includes('At lunch!')) {
          setDoNotDisturbResult('🍽️ At lunch!')
        } else if (data.error.includes('Panic')) {
          setDoNotDisturbResult('⚠️ Invalid time (≥2400)')
        } else {
          throw new Error(data.error)
        }
      }
    } catch (error) {
      console.error('DoNotDisturb error:', error)
      setError('Failed to call DoNotDisturb function')
    } finally {
      setIsCalculating(null)
    }
  }

  const getFizzBuzzColor = (result: string) => {
    if (result === 'Fizz') return 'bg-blue-50 border-blue-400 text-blue-700'
    if (result === 'Buzz') return 'bg-yellow-50 border-yellow-400 text-yellow-700'
    if (result === 'FizzBuzz') return 'bg-purple-50 border-purple-400 text-purple-700'
    if (result === 'Splat') return 'bg-gray-50 border-gray-400 text-gray-700'
    return 'bg-green-50 border-green-400 text-green-700'
  }

  const getTimeColor = (result: string) => {
    if (result.includes('Morning')) return 'bg-yellow-50 border-yellow-400 text-yellow-700'
    if (result.includes('Afternoon')) return 'bg-orange-50 border-orange-400 text-orange-700'
    if (result.includes('Evening')) return 'bg-blue-50 border-blue-400 text-blue-700'
    if (result.includes('After Hours') || result.includes('lunch') || result.includes('Invalid')) {
      return 'bg-red-50 border-red-400 text-red-700'
    }
    return 'bg-green-50 border-green-400 text-green-700'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">ControlStructures Contract</h2>
        <div className="text-sm text-gray-500">
          <p>Contract: {CONTROL_STRUCTURES_ADDRESS.slice(0, 6)}...{CONTROL_STRUCTURES_ADDRESS.slice(-4)}</p>
          <p>Network: Base Sepolia</p>
        </div>
      </div>
      
      {!isConnected ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please connect your wallet to interact with this contract</p>
          <appkit-button />
        </div>
      ) : (
        <div className="space-y-8">
          {/* FizzBuzz Section */}
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🎯 FizzBuzz Function</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter a Number</label>
                <input
                  type="text"
                  value={fizzBuzzInput}
                  onChange={(e) => setFizzBuzzInput(e.target.value)}
                  placeholder="Enter any positive number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isCalculating === 'fizzbuzz'}
                />
              </div>
              
              <button
                onClick={handleFizzBuzz}
                disabled={!fizzBuzzInput || isCalculating === 'fizzbuzz'}
                className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isCalculating === 'fizzbuzz' ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Run FizzBuzz'
                )}
              </button>

              {fizzBuzzResult && (
                <div className={`p-4 rounded-lg border-l-4 ${getFizzBuzzColor(fizzBuzzResult)}`}>
                  <p className="font-semibold text-lg">Result: {fizzBuzzResult}</p>
                  <p className="text-sm mt-1">
                    {fizzBuzzResult === 'Fizz' && '🔵 Number is divisible by 3'}
                    {fizzBuzzResult === 'Buzz' && '🟡 Number is divisible by 5'}
                    {fizzBuzzResult === 'FizzBuzz' && '🟣 Number is divisible by both 3 and 5'}
                    {fizzBuzzResult === 'Splat' && '⚪ Number is not divisible by 3 or 5'}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">FizzBuzz Rules:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Returns "Fizz" if divisible by 3</li>
                  <li>• Returns "Buzz" if divisible by 5</li>
                  <li>• Returns "FizzBuzz" if divisible by both 3 and 5</li>
                  <li>• Returns "Splat" if none of the above</li>
                </ul>
              </div>
            </div>
          </div>

          {/* DoNotDisturb Section */}
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🕐 Do Not Disturb Function</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter Time (24-hour format)</label>
                <input
                  type="text"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  placeholder="e.g., 1430 for 2:30 PM"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isCalculating === 'time'}
                />
              </div>
              
              <button
                onClick={handleDoNotDisturb}
                disabled={!timeInput || isCalculating === 'time'}
                className="w-full p-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isCalculating === 'time' ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Check Time Status'
                )}
              </button>

              {doNotDisturbResult && (
                <div className={`p-4 rounded-lg border-l-4 ${getTimeColor(doNotDisturbResult)}`}>
                  <p className="font-semibold text-lg">Status: {doNotDisturbResult}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Time Rules:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 0800-1199: "Morning!"</li>
                  <li>• 1200-1259: "At lunch!" (revert)</li>
                  <li>• 1300-1799: "Afternoon!"</li>
                  <li>• 1800-2200: "Evening!"</li>
                  <li>• 2201-0759: "AfterHours" (custom error)</li>
                  <li>• ≥2400: Panic (assert false)</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 p-4 rounded-lg">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
