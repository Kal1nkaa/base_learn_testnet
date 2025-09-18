'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

const ARRAYS_EXERCISE_ADDRESS = '0x2a71f0eb0fb5642c72de827e4d08fe25a8204086' as const
const ARRAYS_EXERCISE_ABI = [
  {
    "inputs": [],
    "name": "getNumbers",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSenders",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTimestamps",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "afterY2K",
    "outputs": [
      {"internalType": "uint256[]", "name": "recentTimestamps", "type": "uint256[]"},
      {"internalType": "address[]", "name": "recentSenders", "type": "address[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetNumbers",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256[]", "name": "_toAppend", "type": "uint256[]"}],
    "name": "appendToNumbers",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_unixTimestamp", "type": "uint256"}],
    "name": "saveTimestamp",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetSenders",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetTimestamps",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getNumbersLength",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export default function ArraysExerciseCard() {
  const { isConnected } = useAccount()
  const [numbersArray, setNumbersArray] = useState<string[]>([])
  const [sendersArray, setSendersArray] = useState<string[]>([])
  const [timestampsArray, setTimestampsArray] = useState<string[]>([])
  const [filteredData, setFilteredData] = useState<{timestamps: string[], senders: string[]} | null>(null)
  const [appendInput, setAppendInput] = useState('')
  const [timestampInput, setTimestampInput] = useState('')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const Y2K_TIMESTAMP = 946702800 // January 1, 2000, 12:00am

  const loadArrays = async () => {
    if (!isConnected) return

    setIsLoading('load')
    setError(null)
    try {
      const responses = await Promise.all([
        fetch('/api/contract-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: ARRAYS_EXERCISE_ADDRESS,
            abi: ARRAYS_EXERCISE_ABI,
            functionName: 'getNumbers',
            args: []
          })
        }),
        fetch('/api/contract-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: ARRAYS_EXERCISE_ADDRESS,
            abi: ARRAYS_EXERCISE_ABI,
            functionName: 'getSenders',
            args: []
          })
        }),
        fetch('/api/contract-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: ARRAYS_EXERCISE_ADDRESS,
            abi: ARRAYS_EXERCISE_ABI,
            functionName: 'getTimestamps',
            args: []
          })
        })
      ])

      const data = await Promise.all(responses.map(r => r.json()))
      
      if (data.every(d => d.success)) {
        setNumbersArray(data[0].result || [])
        setSendersArray(data[1].result || [])
        setTimestampsArray(data[2].result || [])
      } else {
        throw new Error('Failed to load arrays data')
      }
    } catch (error) {
      console.error('Load arrays error:', error)
      setError('Failed to load arrays data')
    } finally {
      setIsLoading(null)
    }
  }

  const handleAppendNumbers = async () => {
    if (!appendInput || !isConnected) return

    setIsLoading('append')
    setError(null)
    setSuccessMessage(null)
    try {
      const numbers = appendInput.split(',').map(n => n.trim()).filter(n => n)
      if (numbers.some(n => isNaN(Number(n)) || Number(n) < 0)) {
        throw new Error('Please enter valid positive numbers separated by commas')
      }

      // Note: This would require a write operation, which needs wallet transaction
      setSuccessMessage(`Would append [${numbers.join(', ')}] to numbers array (requires wallet transaction)`)
      setAppendInput('')
    } catch (error: any) {
      console.error('Append numbers error:', error)
      setError(error.message || 'Failed to append numbers')
    } finally {
      setIsLoading(null)
    }
  }

  const handleSaveTimestamp = async () => {
    if (!timestampInput || !isConnected) return

    setIsLoading('timestamp')
    setError(null)
    setSuccessMessage(null)
    try {
      const timestamp = parseInt(timestampInput)
      if (timestamp <= 0) {
        throw new Error('Please enter a valid Unix timestamp')
      }

      // Note: This would require a write operation
      setSuccessMessage(`Would save timestamp ${timestamp} (requires wallet transaction)`)
      setTimestampInput('')
    } catch (error: any) {
      console.error('Save timestamp error:', error)
      setError(error.message || 'Failed to save timestamp')
    } finally {
      setIsLoading(null)
    }
  }

  const handleFilterAfterY2K = async () => {
    if (!isConnected) return

    setIsLoading('filter')
    setError(null)
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: ARRAYS_EXERCISE_ADDRESS,
          abi: ARRAYS_EXERCISE_ABI,
          functionName: 'afterY2K',
          args: []
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setFilteredData({
          timestamps: data.result[0] || [],
          senders: data.result[1] || []
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      console.error('Filter error:', error)
      setError(error.message || 'Failed to filter timestamps')
    } finally {
      setIsLoading(null)
    }
  }

  const handleReset = async (type: 'numbers' | 'senders' | 'timestamps') => {
    if (!isConnected) return

    setIsLoading(`reset-${type}`)
    setError(null)
    setSuccessMessage(null)
    try {
      // Note: This would require a write operation
      setSuccessMessage(`Would reset ${type} array (requires wallet transaction)`)
      
      // Refresh data after reset
      setTimeout(() => loadArrays(), 1000)
    } catch (error) {
      console.error(`Reset ${type} error:`, error)
      setError(`Failed to reset ${type}`)
    } finally {
      setIsLoading(null)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      isAfterY2K: parseInt(timestamp) > Y2K_TIMESTAMP
    }
  }

  const getCurrentTimestamp = () => {
    return Math.floor(Date.now() / 1000).toString()
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">ArraysExercise Contract</h2>
        <div className="text-sm text-gray-500">
          <p>Contract: {ARRAYS_EXERCISE_ADDRESS.slice(0, 6)}...{ARRAYS_EXERCISE_ADDRESS.slice(-4)}</p>
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
          {/* Load Arrays Section */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">📊 Contract Arrays</h3>
              <button
                onClick={loadArrays}
                disabled={isLoading === 'load'}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading === 'load' ? 'Loading...' : 'Load Arrays'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Numbers Array */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Numbers Array</h4>
                <div className="max-h-32 overflow-y-auto">
                  {numbersArray.length > 0 ? (
                    <p className="text-sm text-gray-600 font-mono">
                      [{numbersArray.join(', ')}]
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">No data loaded</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Length: {numbersArray.length}</p>
              </div>

              {/* Senders Array */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Senders Array</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {sendersArray.length > 0 ? (
                    sendersArray.map((sender, index) => (
                      <p key={index} className="text-xs text-gray-600 font-mono">
                        {sender.slice(0, 6)}...{sender.slice(-4)}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No data loaded</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Length: {sendersArray.length}</p>
              </div>

              {/* Timestamps Array */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Timestamps Array</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {timestampsArray.length > 0 ? (
                    timestampsArray.map((timestamp, index) => {
                      const formatted = formatTimestamp(timestamp)
                      return (
                        <div key={index} className="text-xs">
                          <p className="text-gray-600 font-mono">{timestamp}</p>
                          <p className="text-gray-500">{formatted.date} {formatted.time}</p>
                          {formatted.isAfterY2K && <span className="text-green-600">✓ After Y2K</span>}
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-gray-500">No data loaded</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Length: {timestampsArray.length}</p>
              </div>
            </div>
          </div>

          {/* Append Numbers Section */}
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">➕ Append to Numbers</h3>
            <div className="flex space-x-4">
              <input
                type="text"
                value={appendInput}
                onChange={(e) => setAppendInput(e.target.value)}
                placeholder="Enter numbers separated by commas (e.g., 11,12,13)"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading === 'append'}
              />
              <button
                onClick={handleAppendNumbers}
                disabled={!appendInput || isLoading === 'append'}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isLoading === 'append' ? 'Processing...' : 'Append'}
              </button>
            </div>
          </div>

          {/* Save Timestamp Section */}
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🕐 Save Timestamp</h3>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={timestampInput}
                  onChange={(e) => setTimestampInput(e.target.value)}
                  placeholder="Enter Unix timestamp"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading === 'timestamp'}
                />
                <button
                  onClick={() => setTimestampInput(getCurrentTimestamp())}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  Use Now
                </button>
                <button
                  onClick={handleSaveTimestamp}
                  disabled={!timestampInput || isLoading === 'timestamp'}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading === 'timestamp' ? 'Processing...' : 'Save'}
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Y2K Timestamp: {Y2K_TIMESTAMP} (Jan 1, 2000 12:00 AM)
                {timestampInput && ` | Your input: ${timestampInput} ${parseInt(timestampInput) > Y2K_TIMESTAMP ? '(After Y2K ✓)' : '(Before Y2K)'}`}
              </p>
            </div>
          </div>

          {/* Filter After Y2K Section */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">🔍 Filter After Y2K</h3>
              <button
                onClick={handleFilterAfterY2K}
                disabled={isLoading === 'filter'}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading === 'filter' ? 'Filtering...' : 'Filter'}
              </button>
            </div>

            {filteredData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-medium text-indigo-800 mb-2">Recent Timestamps</h4>
                  <div className="space-y-1">
                    {filteredData.timestamps.length > 0 ? (
                      filteredData.timestamps.map((timestamp, index) => {
                        const formatted = formatTimestamp(timestamp)
                        return (
                          <div key={index} className="text-sm">
                            <p className="text-indigo-700 font-mono">{timestamp}</p>
                            <p className="text-indigo-600">{formatted.date} {formatted.time}</p>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-sm text-indigo-600">No timestamps after Y2K</p>
                    )}
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-medium text-indigo-800 mb-2">Corresponding Senders</h4>
                  <div className="space-y-1">
                    {filteredData.senders.length > 0 ? (
                      filteredData.senders.map((sender, index) => (
                        <p key={index} className="text-sm text-indigo-700 font-mono">
                          {sender.slice(0, 6)}...{sender.slice(-4)}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-indigo-600">No corresponding senders</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reset Functions Section */}
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🔄 Reset Functions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleReset('numbers')}
                disabled={isLoading === 'reset-numbers'}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading === 'reset-numbers' ? 'Processing...' : 'Reset Numbers'}
              </button>
              <button
                onClick={() => handleReset('senders')}
                disabled={isLoading === 'reset-senders'}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading === 'reset-senders' ? 'Processing...' : 'Reset Senders'}
              </button>
              <button
                onClick={() => handleReset('timestamps')}
                disabled={isLoading === 'reset-timestamps'}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading === 'reset-timestamps' ? 'Processing...' : 'Reset Timestamps'}
              </button>
            </div>
          </div>

          {/* Contract Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Array Functions:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>getNumbers():</strong> Returns complete numbers array</li>
              <li>• <strong>appendToNumbers():</strong> Adds new numbers to the array</li>
              <li>• <strong>resetNumbers():</strong> Resets to [1,2,3,4,5,6,7,8,9,10]</li>
              <li>• <strong>saveTimestamp():</strong> Saves caller address and timestamp</li>
              <li>• <strong>afterY2K():</strong> Filters timestamps after Jan 1, 2000</li>
              <li>• <strong>resetSenders/Timestamps():</strong> Clear respective arrays</li>
            </ul>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 p-4 rounded-lg">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-400 text-green-700 p-4 rounded-lg">
              <p className="font-semibold">Note:</p>
              <p>{successMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
