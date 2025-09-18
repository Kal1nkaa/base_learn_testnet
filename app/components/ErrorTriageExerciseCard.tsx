'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

const ERROR_TRIAGE_ADDRESS = '0xC3544f55b9d2174fe781703F94C0a724a959f5c2' as const
const ERROR_TRIAGE_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "_a", "type": "uint256"},
      {"internalType": "uint256", "name": "_b", "type": "uint256"},
      {"internalType": "uint256", "name": "_c", "type": "uint256"},
      {"internalType": "uint256", "name": "_d", "type": "uint256"}
    ],
    "name": "diffWithNeighbor",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_base", "type": "uint256"},
      {"internalType": "int256", "name": "_modifier", "type": "int256"}
    ],
    "name": "applyModifier",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "popWithReturn",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_num", "type": "uint256"}],
    "name": "addToArr",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getArr",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetArr",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export default function ErrorTriageExerciseCard() {
  const { isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'diff' | 'modifier' | 'array'>('diff')
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Diff function inputs
  const [diffInputs, setDiffInputs] = useState({ a: '', b: '', c: '', d: '' })
  
  // Modifier function inputs
  const [modifierInputs, setModifierInputs] = useState({ base: '', modifier: '' })
  
  // Array function inputs
  const [arrayInput, setArrayInput] = useState('')
  const [currentArray, setCurrentArray] = useState<string[]>([])

  const callContract = async (functionName: string, args: any[]) => {
    if (!isConnected) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: ERROR_TRIAGE_ADDRESS,
          abi: ERROR_TRIAGE_ABI,
          functionName,
          args
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResult(data.result)
        
        // If it's an array operation, update the current array state
        if (functionName === 'getArr' || functionName === 'addToArr' || functionName === 'resetArr') {
          const arrResponse = await fetch('/api/contract-call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address: ERROR_TRIAGE_ADDRESS,
              abi: ERROR_TRIAGE_ABI,
              functionName: 'getArr',
              args: []
            })
          })
          const arrData = await arrResponse.json()
          if (arrData.success) {
            setCurrentArray(arrData.result.map((item: any) => item.toString()))
          }
        }
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to call contract function')
      console.error('Contract call error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDiffCalculation = () => {
    const { a, b, c, d } = diffInputs
    if (!a || !b || !c || !d) return
    
    callContract('diffWithNeighbor', [
      BigInt(a).toString(),
      BigInt(b).toString(), 
      BigInt(c).toString(),
      BigInt(d).toString()
    ])
  }

  const handleModifierApplication = () => {
    const { base, modifier } = modifierInputs
    if (!base || !modifier) return
    
    callContract('applyModifier', [
      BigInt(base).toString(),
      BigInt(modifier).toString()
    ])
  }

  const handleAddToArray = () => {
    if (!arrayInput) return
    callContract('addToArr', [BigInt(arrayInput).toString()])
    setArrayInput('')
  }

  const handlePopFromArray = () => {
    callContract('popWithReturn', [])
  }

  const handleResetArray = () => {
    callContract('resetArr', [])
  }

  const handleGetArray = () => {
    callContract('getArr', [])
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Error Triage Exercise</h2>
        <div className="text-sm text-gray-500">
          <p>Contract: {ERROR_TRIAGE_ADDRESS === '0xd11365F6608668Eb8b7E81cA749dcFeabea4efeB' ? 'Not Deployed' : `${ERROR_TRIAGE_ADDRESS.slice(0, 6)}...${ERROR_TRIAGE_ADDRESS.slice(-4)}`}</p>
          <p>Network: Base Sepolia</p>
        </div>
      </div>

      {ERROR_TRIAGE_ADDRESS === '0xd11365F6608668Eb8b7E81cA749dcFeabea4efeB' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-yellow-600">⚠️</div>
            <p className="ml-2 text-yellow-800">
              Contract not yet deployed. Please deploy the contract first to interact with it.
            </p>
          </div>
        </div>
      )}
      
      {!isConnected ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please connect your wallet to interact with this contract</p>
          <appkit-button />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-2 border-b border-gray-200">
            {[
              { key: 'diff', label: '📊 Neighbor Diff', desc: 'Calculate absolute differences' },
              { key: 'modifier', label: '🔄 Apply Modifier', desc: 'Modify base values safely' },
              { key: 'array', label: '📝 Array Operations', desc: 'Manage array with pop/push' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-t-lg transition-all ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-sm font-medium">{tab.label}</div>
                <div className="text-xs opacity-75">{tab.desc}</div>
              </button>
            ))}
          </div>

          {/* Diff With Neighbor Tab */}
          {activeTab === 'diff' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Neighbor Difference Calculator</h3>
              <p className="text-sm text-gray-600">
                Calculate absolute differences between neighboring values: |a-b|, |b-c|, |c-d|
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['a', 'b', 'c', 'd'].map(key => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Value {key.toUpperCase()}</label>
                    <input
                      type="text"
                      value={diffInputs[key as keyof typeof diffInputs]}
                      onChange={(e) => setDiffInputs(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={`Enter ${key}`}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleDiffCalculation}
                disabled={!diffInputs.a || !diffInputs.b || !diffInputs.c || !diffInputs.d || isLoading}
                className="w-full p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isLoading ? '⏳ Calculating...' : '📊 Calculate Neighbor Differences'}
              </button>
            </div>
          )}

          {/* Apply Modifier Tab */}
          {activeTab === 'modifier' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Safe Modifier Application</h3>
              <p className="text-sm text-gray-600">
                Apply positive or negative modifiers to a base value (≥1000). Modifiers range: -100 to +100
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Value (≥1000)</label>
                  <input
                    type="text"
                    value={modifierInputs.base}
                    onChange={(e) => setModifierInputs(prev => ({ ...prev, base: e.target.value }))}
                    placeholder="Enter base value"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modifier (-100 to +100)</label>
                  <input
                    type="text"
                    value={modifierInputs.modifier}
                    onChange={(e) => setModifierInputs(prev => ({ ...prev, modifier: e.target.value }))}
                    placeholder="Enter modifier"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <button
                onClick={handleModifierApplication}
                disabled={!modifierInputs.base || !modifierInputs.modifier || isLoading}
                className="w-full p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isLoading ? '⏳ Processing...' : '🔄 Apply Modifier Safely'}
              </button>
            </div>
          )}

          {/* Array Operations Tab */}
          {activeTab === 'array' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Array Management</h3>
              <p className="text-sm text-gray-600">
                Add, remove, and view elements in the contract's array with proper error handling
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Current Array:</h4>
                <div className="flex items-center space-x-2">
                  <div className="bg-white rounded border p-2 min-h-[40px] flex-1">
                    {currentArray.length > 0 ? (
                      <span className="text-sm">[{currentArray.join(', ')}]</span>
                    ) : (
                      <span className="text-gray-500 text-sm">Empty array</span>
                    )}
                  </div>
                  <button
                    onClick={handleGetArray}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Add to Array</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={arrayInput}
                      onChange={(e) => setArrayInput(e.target.value)}
                      placeholder="Enter number"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleAddToArray}
                      disabled={!arrayInput || isLoading}
                      className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      ➕ Add
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Array Actions</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePopFromArray}
                      disabled={isLoading}
                      className="flex-1 p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      ⬆️ Pop & Return
                    </button>
                    <button
                      onClick={handleResetArray}
                      disabled={isLoading}
                      className="flex-1 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      🗑️ Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result !== null && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Result:</h4>
              <div className="bg-white rounded p-3 font-mono text-sm">
                {Array.isArray(result) ? (
                  <span>[{result.map(item => item.toString()).join(', ')}]</span>
                ) : (
                  <span>{result.toString()}</span>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Error:</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Contract Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">🔧 Debugging Exercise - Fixed Issues:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>diffWithNeighbor:</strong> Added absolute value calculation to prevent underflow</li>
              <li>• <strong>applyModifier:</strong> Proper handling of negative modifiers with underflow protection</li>
              <li>• <strong>popWithReturn:</strong> Fixed to store value before popping and added empty array check</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
