'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

const IMPORTS_EXERCISE_ADDRESS = '0x63E8c947Ff8232c4e7FF0e737468525786c64962' as const

const IMPORTS_EXERCISE_ABI = [
  {
    "inputs": [],
    "name": "haiku",
    "outputs": [{"internalType": "string", "name": "line1", "type": "string"}, {"internalType": "string", "name": "line2", "type": "string"}, {"internalType": "string", "name": "line3", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getHaiku",
    "outputs": [{"components": [{"internalType": "string", "name": "line1", "type": "string"}, {"internalType": "string", "name": "line2", "type": "string"}, {"internalType": "string", "name": "line3", "type": "string"}], "internalType": "struct SillyStringUtils.Haiku", "name": "", "type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_line1", "type": "string"}, {"internalType": "string", "name": "_line2", "type": "string"}, {"internalType": "string", "name": "_line3", "type": "string"}],
    "name": "saveHaiku",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "shruggieHaiku",
    "outputs": [{"components": [{"internalType": "string", "name": "line1", "type": "string"}, {"internalType": "string", "name": "line2", "type": "string"}, {"internalType": "string", "name": "line3", "type": "string"}], "internalType": "struct SillyStringUtils.Haiku", "name": "", "type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isHaikuEmpty",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLine1",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLine2",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLine3",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "clearHaiku",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getHaikuLines",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}, {"internalType": "string", "name": "", "type": "string"}, {"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_input", "type": "string"}],
    "name": "applyShruggie",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getHaikuLength",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFormattedHaiku",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFullShruggieHaiku",
    "outputs": [{"components": [{"internalType": "string", "name": "line1", "type": "string"}, {"internalType": "string", "name": "line2", "type": "string"}, {"internalType": "string", "name": "line3", "type": "string"}], "internalType": "struct SillyStringUtils.Haiku", "name": "", "type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

interface Haiku {
  line1: string
  line2: string
  line3: string
}

export default function ImportsExerciseCard() {
  const { isConnected } = useAccount()
  const [newHaiku, setNewHaiku] = useState({ line1: '', line2: '', line3: '' })
  const [customShruggie, setCustomShruggie] = useState('')
  const [shruggieResult, setShruggieResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Read contract data
  const { data: currentHaiku, refetch: refetchHaiku } = useReadContract({
    address: IMPORTS_EXERCISE_ADDRESS,
    abi: IMPORTS_EXERCISE_ABI,
    functionName: 'getHaiku',
  })

  const { data: isHaikuEmpty } = useReadContract({
    address: IMPORTS_EXERCISE_ADDRESS,
    abi: IMPORTS_EXERCISE_ABI,
    functionName: 'isHaikuEmpty',
  })

  const { data: haikuLength } = useReadContract({
    address: IMPORTS_EXERCISE_ADDRESS,
    abi: IMPORTS_EXERCISE_ABI,
    functionName: 'getHaikuLength',
  })

  const { data: formattedHaiku } = useReadContract({
    address: IMPORTS_EXERCISE_ADDRESS,
    abi: IMPORTS_EXERCISE_ABI,
    functionName: 'getFormattedHaiku',
  })

  const { data: shruggieHaiku } = useReadContract({
    address: IMPORTS_EXERCISE_ADDRESS,
    abi: IMPORTS_EXERCISE_ABI,
    functionName: 'shruggieHaiku',
  })

  const { data: fullShruggieHaiku } = useReadContract({
    address: IMPORTS_EXERCISE_ADDRESS,
    abi: IMPORTS_EXERCISE_ABI,
    functionName: 'getFullShruggieHaiku',
  })

  // Write contract functions
  const { writeContract: writeSaveHaiku, data: saveHaikuHash } = useWriteContract()
  const { writeContract: writeClearHaiku, data: clearHaikuHash } = useWriteContract()

  // Wait for transactions
  const { isLoading: isSavingConfirming, isSuccess: isSavingSuccess } = useWaitForTransactionReceipt({ hash: saveHaikuHash })
  const { isLoading: isClearingConfirming, isSuccess: isClearingSuccess } = useWaitForTransactionReceipt({ hash: clearHaikuHash })

  useEffect(() => {
    if (isSavingSuccess || isClearingSuccess) {
      refetchHaiku()
      setError(null)
      setSuccessMessage('Transaction completed successfully!')
      if (isSavingSuccess) {
        setNewHaiku({ line1: '', line2: '', line3: '' })
      }
    }
  }, [isSavingSuccess, isClearingSuccess, refetchHaiku])

  const handleSaveHaiku = async () => {
    if (!newHaiku.line1 || !newHaiku.line2 || !newHaiku.line3 || !isConnected) return
    setError(null)
    setSuccessMessage(null)
    try {
      writeSaveHaiku({
        address: IMPORTS_EXERCISE_ADDRESS,
        abi: IMPORTS_EXERCISE_ABI,
        functionName: 'saveHaiku',
        args: [newHaiku.line1, newHaiku.line2, newHaiku.line3],
      })
    } catch (e: any) {
      setError(e.message || 'Failed to save haiku')
    }
  }

  const handleClearHaiku = async () => {
    if (!isConnected) return
    setError(null)
    setSuccessMessage(null)
    try {
      writeClearHaiku({
        address: IMPORTS_EXERCISE_ADDRESS,
        abi: IMPORTS_EXERCISE_ABI,
        functionName: 'clearHaiku',
      })
    } catch (e: any) {
      setError(e.message || 'Failed to clear haiku')
    }
  }

  const handleApplyShruggie = async () => {
    if (!customShruggie) return
    setError(null)
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: IMPORTS_EXERCISE_ADDRESS,
          abi: IMPORTS_EXERCISE_ABI,
          functionName: 'applyShruggie',
          args: [customShruggie]
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setShruggieResult(data.result)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Apply shruggie error:', error)
      setError('Failed to apply shruggie')
    }
  }

  const getHaikuIcon = () => '📝'
  const getLibraryIcon = () => '📚'
  const getShruggieIcon = () => '🤷'

  const sampleHaikus = [
    {
      line1: "Smart contracts execute",
      line2: "Immutable logic on chain", 
      line3: "Decentralized trust"
    },
    {
      line1: "Solidity flows",
      line2: "Through virtual machine gas",
      line3: "Ethereum dreams"
    },
    {
      line1: "Code imports wisdom",
      line2: "Libraries share their power",
      line3: "Modular beauty"
    }
  ]

  const loadSampleHaiku = (index: number) => {
    setNewHaiku(sampleHaikus[index])
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">📚 Imports Exercise</h2>
        <div className="text-sm text-gray-500">
          <p>Contract: {IMPORTS_EXERCISE_ADDRESS.slice(0, 6)}...{IMPORTS_EXERCISE_ADDRESS.slice(-4)}</p>
          <p>Network: Base Sepolia</p>
        </div>
      </div>

      {!isConnected ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please connect your wallet to interact with imports contract</p>
          <appkit-button />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Import Architecture Diagram */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">{getLibraryIcon()} Import Architecture</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-800">SillyStringUtils.sol (Library)</h4>
                <pre className="text-sm text-gray-700 mt-2 bg-gray-100 p-3 rounded">
{`library SillyStringUtils {
    struct Haiku {
        string line1;
        string line2; 
        string line3;
    }
    
    function shruggie(string memory _input) 
        internal pure returns (string memory) {
        return string.concat(_input, unicode" 🤷");
    }
}`}
                </pre>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                <h4 className="font-semibold text-green-800">ImportsExercise.sol (Contract)</h4>
                <pre className="text-sm text-gray-700 mt-2 bg-gray-100 p-3 rounded">
{`import "./SillyStringUtils.sol";

contract ImportsExercise {
    using SillyStringUtils for string;
    SillyStringUtils.Haiku public haiku;
    
    function saveHaiku(...) { /* implementation */ }
    function getHaiku() returns (Haiku memory) { /* implementation */ }
    function shruggieHaiku() { /* uses library */ }
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Current Haiku Display */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-purple-800">
                {getHaikuIcon()} Current Haiku
              </h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-purple-600">
                  {isHaikuEmpty ? 'Empty' : `${haikuLength} chars`}
                </span>
                {!isHaikuEmpty && (
                  <button
                    onClick={handleClearHaiku}
                    disabled={isClearingConfirming}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    {isClearingConfirming ? 'Clearing...' : 'Clear'}
                  </button>
                )}
              </div>
            </div>

            {isHaikuEmpty ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">{getHaikuIcon()}</div>
                <p>No haiku saved yet. Create one below!</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="space-y-2 text-lg text-gray-800 font-serif leading-relaxed">
                  <div className="text-center">
                    <p className="italic">{currentHaiku?.[0]}</p>
                    <p className="italic">{currentHaiku?.[1]}</p>
                    <p className="italic">{currentHaiku?.[2]}</p>
                  </div>
                </div>
                
                {/* Formatted version */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Formatted Output:</h4>
                  <pre className="text-sm text-gray-700 bg-gray-100 p-3 rounded whitespace-pre-wrap">
                    {formattedHaiku}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Library Function Demonstrations */}
          {!isHaikuEmpty && (
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="text-xl font-semibold text-yellow-800 mb-4">
                {getShruggieIcon()} Library Function Demos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Shruggie Haiku (line3 only) */}
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">shruggieHaiku() - Line 3 Modified:</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="italic">{shruggieHaiku?.[0]}</p>
                    <p className="italic">{shruggieHaiku?.[1]}</p>
                    <p className="italic font-bold text-yellow-700">{shruggieHaiku?.[2]}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Original haiku unchanged, only line 3 gets 🤷</p>
                </div>

                {/* Full Shruggie Haiku */}
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">getFullShruggieHaiku() - All Lines:</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="italic font-bold text-yellow-700">{fullShruggieHaiku?.[0]}</p>
                    <p className="italic font-bold text-yellow-700">{fullShruggieHaiku?.[1]}</p>
                    <p className="italic font-bold text-yellow-700">{fullShruggieHaiku?.[2]}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">All lines get the shruggie treatment</p>
                </div>
              </div>
            </div>
          )}

          {/* Create New Haiku */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-xl font-semibold text-green-800 mb-4">✍️ Create New Haiku</h3>
            
            {/* Sample Haikus */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Sample Haikus:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {sampleHaikus.map((haiku, index) => (
                  <button
                    key={index}
                    onClick={() => loadSampleHaiku(index)}
                    className="text-left p-3 bg-white rounded border hover:border-green-400 transition-colors"
                  >
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>{haiku.line1}</p>
                      <p>{haiku.line2}</p>
                      <p>{haiku.line3}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Line 1 (5 syllables)</label>
                <input
                  type="text"
                  value={newHaiku.line1}
                  onChange={(e) => setNewHaiku({...newHaiku, line1: e.target.value})}
                  placeholder="Code flows like water"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isSavingConfirming}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Line 2 (7 syllables)</label>
                <input
                  type="text"
                  value={newHaiku.line2}
                  onChange={(e) => setNewHaiku({...newHaiku, line2: e.target.value})}
                  placeholder="Smart contracts dancing free"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isSavingConfirming}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Line 3 (5 syllables)</label>
                <input
                  type="text"
                  value={newHaiku.line3}
                  onChange={(e) => setNewHaiku({...newHaiku, line3: e.target.value})}
                  placeholder="Blockchain harmony"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isSavingConfirming}
                />
              </div>
              <button
                onClick={handleSaveHaiku}
                disabled={!newHaiku.line1 || !newHaiku.line2 || !newHaiku.line3 || isSavingConfirming}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSavingConfirming ? 'Saving Haiku...' : 'Save Haiku to Blockchain'}
              </button>
            </div>
          </div>

          {/* Custom Shruggie Tester */}
          <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
            <h3 className="text-xl font-semibold text-orange-800 mb-4">
              {getShruggieIcon()} Custom Shruggie Tester
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Test the SillyStringUtils.shruggie() function with any text:
            </p>
            
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                value={customShruggie}
                onChange={(e) => setCustomShruggie(e.target.value)}
                placeholder="Enter any text to get shruggie'd"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                onClick={handleApplyShruggie}
                disabled={!customShruggie}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Apply Shruggie
              </button>
            </div>
            
            {shruggieResult && (
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="font-medium text-gray-800 mb-2">Result:</h4>
                <p className="text-lg text-orange-700 font-medium">{shruggieResult}</p>
              </div>
            )}
          </div>

          {/* Exercise Requirements Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">✅ Exercise Requirements Fulfilled:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h5 className="font-medium text-gray-800">Library Import:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>SillyStringUtils library with Haiku struct</li>
                  <li>shruggie() function adding 🤷 emoji</li>
                  <li>Proper import statement using relative path</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-800">Contract Functions:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>saveHaiku() accepts three strings</li>
                  <li>getHaiku() returns Haiku struct (not individual members)</li>
                  <li>shruggieHaiku() uses library without modifying original</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-800">Public State:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>public Haiku haiku instance</li>
                  <li>Auto-generated getter returns individual members</li>
                  <li>Custom getter returns complete struct</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-800">Advanced Features:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Unicode emoji handling (🤷)</li>
                  <li>String concatenation with library function</li>
                  <li>Immutable library operations (no side effects)</li>
                </ul>
              </div>
            </div>
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
              <p className="font-semibold">Success:</p>
              <p>{successMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
