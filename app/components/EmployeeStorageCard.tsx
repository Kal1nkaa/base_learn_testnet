'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

const EMPLOYEE_STORAGE_ADDRESS = '0xb15DFAce780Ad3698Af7FCa43efb7088081F57AC' as const
const EMPLOYEE_STORAGE_ABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "idNumber",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "viewSalary",
    "outputs": [{"internalType": "uint32", "name": "", "type": "uint32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "viewShares",
    "outputs": [{"internalType": "uint16", "name": "", "type": "uint16"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint16", "name": "_newShares", "type": "uint16"}],
    "name": "grantShares",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "debugResetShares",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_slot", "type": "uint256"}],
    "name": "checkForPacking",
    "outputs": [{"internalType": "uint256", "name": "r", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export default function EmployeeStorageCard() {
  const { isConnected } = useAccount()
  const [employeeData, setEmployeeData] = useState<{
    name: string;
    idNumber: string;
    salary: string;
    shares: string;
  } | null>(null)
  const [grantSharesInput, setGrantSharesInput] = useState('')
  const [storageSlotInput, setStorageSlotInput] = useState('')
  const [storageResult, setStorageResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<'data' | 'grant' | 'reset' | 'storage' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadEmployeeData = async () => {
    if (!isConnected) return

    setIsLoading('data')
    setError(null)
    try {
      const responses = await Promise.all([
        fetch('/api/contract-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: EMPLOYEE_STORAGE_ADDRESS,
            abi: EMPLOYEE_STORAGE_ABI,
            functionName: 'name',
            args: []
          })
        }),
        fetch('/api/contract-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: EMPLOYEE_STORAGE_ADDRESS,
            abi: EMPLOYEE_STORAGE_ABI,
            functionName: 'idNumber',
            args: []
          })
        }),
        fetch('/api/contract-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: EMPLOYEE_STORAGE_ADDRESS,
            abi: EMPLOYEE_STORAGE_ABI,
            functionName: 'viewSalary',
            args: []
          })
        }),
        fetch('/api/contract-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: EMPLOYEE_STORAGE_ADDRESS,
            abi: EMPLOYEE_STORAGE_ABI,
            functionName: 'viewShares',
            args: []
          })
        })
      ])

      const data = await Promise.all(responses.map(r => r.json()))
      
      if (data.every(d => d.success)) {
        setEmployeeData({
          name: data[0].result,
          idNumber: data[1].result,
          salary: data[2].result,
          shares: data[3].result
        })
      } else {
        throw new Error('Failed to load employee data')
      }
    } catch (error) {
      console.error('Load data error:', error)
      setError('Failed to load employee data')
    } finally {
      setIsLoading(null)
    }
  }

  const handleGrantShares = async () => {
    if (!grantSharesInput || !isConnected) return

    setIsLoading('grant')
    setError(null)
    setSuccessMessage(null)
    try {
      const shares = parseInt(grantSharesInput)
      if (shares <= 0 || shares > 65535) {
        throw new Error('Please enter a valid number between 1 and 65535')
      }

      // Note: This would require a write operation, which needs wallet transaction
      // For demo purposes, we'll show what would happen
      setSuccessMessage(`Would grant ${shares} shares to employee (requires wallet transaction)`)
      setGrantSharesInput('')
    } catch (error: any) {
      console.error('Grant shares error:', error)
      setError(error.message || 'Failed to grant shares')
    } finally {
      setIsLoading(null)
    }
  }

  const handleResetShares = async () => {
    if (!isConnected) return

    setIsLoading('reset')
    setError(null)
    setSuccessMessage(null)
    try {
      // Note: This would require a write operation
      setSuccessMessage('Would reset shares to 1000 (requires wallet transaction)')
      // Refresh data after reset
      setTimeout(() => loadEmployeeData(), 1000)
    } catch (error) {
      console.error('Reset shares error:', error)
      setError('Failed to reset shares')
    } finally {
      setIsLoading(null)
    }
  }

  const handleCheckStorage = async () => {
    if (!storageSlotInput || !isConnected) return

    setIsLoading('storage')
    setError(null)
    try {
      const slot = parseInt(storageSlotInput)
      if (slot < 0 || slot > 10) {
        throw new Error('Please enter a slot number between 0 and 10')
      }

      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: EMPLOYEE_STORAGE_ADDRESS,
          abi: EMPLOYEE_STORAGE_ABI,
          functionName: 'checkForPacking',
          args: [slot.toString()]
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setStorageResult(`Slot ${slot}: 0x${BigInt(data.result).toString(16)}`)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      console.error('Storage check error:', error)
      setError(error.message || 'Failed to check storage')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">EmployeeStorage Contract</h2>
        <div className="text-sm text-gray-500">
          <p>Contract: {EMPLOYEE_STORAGE_ADDRESS.slice(0, 6)}...{EMPLOYEE_STORAGE_ADDRESS.slice(-4)}</p>
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
          {/* Employee Data Section */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">👤 Employee Information</h3>
              <button
                onClick={loadEmployeeData}
                disabled={isLoading === 'data'}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading === 'data' ? 'Loading...' : 'Load Data'}
              </button>
            </div>

            {employeeData && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-semibold text-gray-800">{employeeData.name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">ID Number</p>
                  <p className="text-lg font-semibold text-gray-800">{employeeData.idNumber}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Salary</p>
                  <p className="text-lg font-semibold text-gray-800">${parseInt(employeeData.salary).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Shares</p>
                  <p className="text-lg font-semibold text-gray-800">{employeeData.shares}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((parseInt(employeeData.shares) / 5000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{Math.min((parseInt(employeeData.shares) / 5000) * 100, 100).toFixed(1)}% of 5000 limit</p>
                </div>
              </div>
            )}
          </div>

          {/* Grant Shares Section */}
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">📈 Grant Shares</h3>
            <div className="flex space-x-4">
              <input
                type="number"
                value={grantSharesInput}
                onChange={(e) => setGrantSharesInput(e.target.value)}
                placeholder="Number of shares to grant"
                min="1"
                max="5000"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading === 'grant'}
              />
              <button
                onClick={handleGrantShares}
                disabled={!grantSharesInput || isLoading === 'grant'}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading === 'grant' ? 'Processing...' : 'Grant Shares'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Note: Cannot grant more than 5000 shares total or more than 5000 in a single transaction
            </p>
          </div>

          {/* Debug Section */}
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🔧 Debug Functions</h3>
            <div className="flex space-x-4 mb-4">
              <button
                onClick={handleResetShares}
                disabled={isLoading === 'reset'}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading === 'reset' ? 'Processing...' : 'Reset Shares to 1000'}
              </button>
            </div>

            <div className="flex space-x-4">
              <input
                type="number"
                value={storageSlotInput}
                onChange={(e) => setStorageSlotInput(e.target.value)}
                placeholder="Storage slot (0-10)"
                min="0"
                max="10"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading === 'storage'}
              />
              <button
                onClick={handleCheckStorage}
                disabled={!storageSlotInput || isLoading === 'storage'}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading === 'storage' ? 'Checking...' : 'Check Storage'}
              </button>
            </div>

            {storageResult && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="font-mono text-sm text-purple-800">{storageResult}</p>
              </div>
            )}
          </div>

          {/* Contract Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Storage Optimization:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Slot 0:</strong> shares (16 bits) + salary (32 bits) = 48 bits total</li>
              <li>• <strong>Slot 1:</strong> idNumber (256 bits)</li>
              <li>• <strong>Slot 2+:</strong> name (dynamic string storage)</li>
              <li>• This packing saves gas by fitting multiple variables in one storage slot</li>
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
