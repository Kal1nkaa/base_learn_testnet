'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

const HAIKU_NFT_ADDRESS = '0xe3c55ce0c0483564BD8a3caF09E3245bF9e54322' as const

const HAIKU_NFT_ABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "counter",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalHaikus",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_line1", "type": "string"},
      {"internalType": "string", "name": "_line2", "type": "string"},
      {"internalType": "string", "name": "_line3", "type": "string"}
    ],
    "name": "mintHaiku",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_to", "type": "address"},
      {"internalType": "uint256", "name": "_haikuId", "type": "uint256"}
    ],
    "name": "shareHaiku",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_haikuId", "type": "uint256"}],
    "name": "getHaiku",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "author", "type": "address"},
          {"internalType": "string", "name": "line1", "type": "string"},
          {"internalType": "string", "name": "line2", "type": "string"},
          {"internalType": "string", "name": "line3", "type": "string"}
        ],
        "internalType": "struct HaikuNFT.Haiku",
        "name": "haiku",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_author", "type": "address"}],
    "name": "getHaikusByAuthor",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "author", "type": "address"},
          {"internalType": "string", "name": "line1", "type": "string"},
          {"internalType": "string", "name": "line2", "type": "string"},
          {"internalType": "string", "name": "line3", "type": "string"}
        ],
        "internalType": "struct HaikuNFT.Haiku[]",
        "name": "authorHaikus",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMySharedHaikus",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "author", "type": "address"},
          {"internalType": "string", "name": "line1", "type": "string"},
          {"internalType": "string", "name": "line2", "type": "string"},
          {"internalType": "string", "name": "line3", "type": "string"}
        ],
        "internalType": "struct HaikuNFT.Haiku[]",
        "name": "sharedHaikuData",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_address", "type": "address"}],
    "name": "getSharedHaikuIds",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

interface Haiku {
  id: number
  author: string
  line1: string
  line2: string
  line3: string
}

interface NFTStats {
  totalHaikus: string
  userNFTs: string
  nextTokenId: string
}

export default function HaikuNFTCard() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'mint' | 'gallery' | 'shared' | 'stats'>('mint')
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // NFT stats
  const [nftStats, setNftStats] = useState<NFTStats>({
    totalHaikus: '0',
    userNFTs: '0',
    nextTokenId: '0'
  })
  
  // Haiku management
  const [userHaikus, setUserHaikus] = useState<Haiku[]>([])
  const [sharedHaikus, setSharedHaikus] = useState<Haiku[]>([])
  
  // Mint inputs
  const [newHaiku, setNewHaiku] = useState({
    line1: '',
    line2: '',
    line3: ''
  })
  
  // Share inputs
  const [shareInputs, setShareInputs] = useState({
    haikuId: '',
    toAddress: ''
  })

  const callContract = async (functionName: string, args: any[]) => {
    if (!isConnected) return null
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: HAIKU_NFT_ADDRESS,
          abi: HAIKU_NFT_ABI,
          functionName,
          args
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResult(data.result)
        return data.result
      } else {
        setError(data.error)
        return null
      }
    } catch (err) {
      setError('Failed to call contract function')
      console.error('Contract call error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const loadNFTStats = async () => {
    if (!isConnected || !address) return
    
    try {
      const [
        totalHaikus,
        userNFTs,
        nextTokenId
      ] = await Promise.all([
        callContract('getTotalHaikus', []),
        callContract('balanceOf', [address]),
        callContract('counter', [])
      ])

      setNftStats({
        totalHaikus: totalHaikus?.toString() || '0',
        userNFTs: userNFTs?.toString() || '0',
        nextTokenId: nextTokenId?.toString() || '0'
      })
    } catch (err) {
      console.error('Error loading NFT stats:', err)
    }
  }

  const loadUserHaikus = async () => {
    if (!isConnected || !address) return
    
    try {
      const haikus = await callContract('getHaikusByAuthor', [address])
      
      if (haikus) {
        const formattedHaikus: Haiku[] = haikus.map((haiku: any, index: number) => ({
          id: index + 1, // This is a simplification - in reality we'd need the actual token ID
          author: haiku.author,
          line1: haiku.line1,
          line2: haiku.line2,
          line3: haiku.line3
        }))
        setUserHaikus(formattedHaikus)
      }
    } catch (err) {
      console.error('Error loading user haikus:', err)
      setUserHaikus([])
    }
  }

  const loadSharedHaikus = async () => {
    if (!isConnected) return
    
    try {
      const sharedHaikus = await callContract('getMySharedHaikus', [])
      
      if (sharedHaikus) {
        const formattedShared: Haiku[] = sharedHaikus.map((haiku: any, index: number) => ({
          id: index + 1,
          author: haiku.author,
          line1: haiku.line1,
          line2: haiku.line2,
          line3: haiku.line3
        }))
        setSharedHaikus(formattedShared)
      }
    } catch (err) {
      console.error('Error loading shared haikus:', err)
      setSharedHaikus([])
    }
  }

  const mintHaiku = async () => {
    if (!newHaiku.line1 || !newHaiku.line2 || !newHaiku.line3) return
    
    const result = await callContract('mintHaiku', [
      newHaiku.line1,
      newHaiku.line2,
      newHaiku.line3
    ])
    
    if (result !== null) {
      setNewHaiku({ line1: '', line2: '', line3: '' })
      await loadNFTStats()
      await loadUserHaikus()
    }
  }

  const shareHaiku = async () => {
    if (!shareInputs.haikuId || !shareInputs.toAddress) return
    
    const result = await callContract('shareHaiku', [
      shareInputs.toAddress,
      parseInt(shareInputs.haikuId)
    ])
    
    if (result !== null) {
      setShareInputs({ haikuId: '', toAddress: '' })
    }
  }

  // Auto-load data when connected
  useEffect(() => {
    if (isConnected && address) {
      loadNFTStats()
      loadUserHaikus()
      loadSharedHaikus()
    }
  }, [isConnected, address])

  const formatNumber = (num: string) => {
    return parseInt(num).toLocaleString()
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const countSyllables = (text: string): number => {
    // Simple syllable counting - not perfect but gives an approximation
    const vowels = 'aeiouyAEIOUY'
    let syllableCount = 0
    let previousWasVowel = false
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const isVowel = vowels.includes(char)
      
      if (isVowel && !previousWasVowel) {
        syllableCount++
      }
      
      previousWasVowel = isVowel
    }
    
    // Handle silent 'e' at the end
    if (text.toLowerCase().endsWith('e') && syllableCount > 1) {
      syllableCount--
    }
    
    // Minimum of 1 syllable per word
    return Math.max(1, syllableCount)
  }

  const getHaikuSyllableCounts = (haiku: Haiku) => {
    return [
      countSyllables(haiku.line1),
      countSyllables(haiku.line2),
      countSyllables(haiku.line3)
    ]
  }

  const isValidHaikuStructure = (line1: string, line2: string, line3: string) => {
    const syllables = [countSyllables(line1), countSyllables(line2), countSyllables(line3)]
    return syllables[0] === 5 && syllables[1] === 7 && syllables[2] === 5
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">HaikuNFT - Poetry on the Blockchain</h2>
        <div className="text-sm text-gray-500">
          <p>Contract: {HAIKU_NFT_ADDRESS === '0x7315785A24FDac7121d63653158B9855579fC40b' ? 'Not Deployed' : `${HAIKU_NFT_ADDRESS.slice(0, 6)}...${HAIKU_NFT_ADDRESS.slice(-4)}`}</p>
          <p>Network: Base Sepolia</p>
        </div>
      </div>

      {HAIKU_NFT_ADDRESS === '0x7315785A24FDac7121d63653158B9855579fC40b' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-yellow-600">⚠️</div>
            <p className="ml-2 text-yellow-800">
              Contract not yet deployed. Please deploy the HaikuNFT contract first.
            </p>
          </div>
        </div>
      )}
      
      {!isConnected ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please connect your wallet to create and share haiku NFTs</p>
          <appkit-button />
        </div>
      ) : (
        <div className="space-y-6">
          {/* NFT Overview */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">🌸 Your Haiku Collection</h3>
              <button
                onClick={loadNFTStats}
                disabled={isLoading}
                className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:opacity-50"
              >
                🔄 Refresh
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{formatNumber(nftStats.userNFTs)}</p>
                <p className="text-sm text-gray-600">Your NFTs</p>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <p className="text-2xl font-bold text-pink-600">{formatNumber(nftStats.totalHaikus)}</p>
                <p className="text-sm text-gray-600">Total Haikus</p>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <p className="text-2xl font-bold text-indigo-600">#{nftStats.nextTokenId}</p>
                <p className="text-sm text-gray-600">Next Token ID</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 border-b border-gray-200">
            {[
              { key: 'mint', label: '✍️ Mint Haiku', desc: 'Create new NFT' },
              { key: 'gallery', label: '🖼️ My Gallery', desc: 'Your haiku NFTs' },
              { key: 'shared', label: '💝 Shared with Me', desc: 'Received haikus' },
              { key: 'stats', label: '📊 Statistics', desc: 'NFT analytics' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-t-lg transition-all ${
                  activeTab === tab.key
                    ? 'bg-purple-500 text-white border-b-2 border-purple-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-sm font-medium">{tab.label}</div>
                <div className="text-xs opacity-75">{tab.desc}</div>
              </button>
            ))}
          </div>

          {/* Mint Tab */}
          {activeTab === 'mint' && (
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">✍️ Create Your Haiku NFT</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Traditional haiku follows the 5-7-5 syllable pattern. Each line must be unique across all haikus!
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Line (5 syllables)
                      {newHaiku.line1 && (
                        <span className={`ml-2 text-xs ${countSyllables(newHaiku.line1) === 5 ? 'text-green-600' : 'text-orange-600'}`}>
                          ({countSyllables(newHaiku.line1)} syllables)
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="Cherry blossoms fall..."
                      value={newHaiku.line1}
                      onChange={(e) => setNewHaiku(prev => ({ ...prev, line1: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Second Line (7 syllables)
                      {newHaiku.line2 && (
                        <span className={`ml-2 text-xs ${countSyllables(newHaiku.line2) === 7 ? 'text-green-600' : 'text-orange-600'}`}>
                          ({countSyllables(newHaiku.line2)} syllables)
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="Petals dance on gentle breeze..."
                      value={newHaiku.line2}
                      onChange={(e) => setNewHaiku(prev => ({ ...prev, line2: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Third Line (5 syllables)
                      {newHaiku.line3 && (
                        <span className={`ml-2 text-xs ${countSyllables(newHaiku.line3) === 5 ? 'text-green-600' : 'text-orange-600'}`}>
                          ({countSyllables(newHaiku.line3)} syllables)
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="Spring's fleeting beauty"
                      value={newHaiku.line3}
                      onChange={(e) => setNewHaiku(prev => ({ ...prev, line3: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                  
                  {newHaiku.line1 && newHaiku.line2 && newHaiku.line3 && (
                    <div className={`p-4 rounded-lg border ${
                      isValidHaikuStructure(newHaiku.line1, newHaiku.line2, newHaiku.line3)
                        ? 'border-green-300 bg-green-50'
                        : 'border-orange-300 bg-orange-50'
                    }`}>
                      <h4 className="font-medium mb-2">Preview:</h4>
                      <div className="text-center italic text-gray-700">
                        <p>{newHaiku.line1}</p>
                        <p>{newHaiku.line2}</p>
                        <p>{newHaiku.line3}</p>
                      </div>
                      <p className={`text-xs mt-2 ${
                        isValidHaikuStructure(newHaiku.line1, newHaiku.line2, newHaiku.line3)
                          ? 'text-green-600'
                          : 'text-orange-600'
                      }`}>
                        Syllable pattern: {countSyllables(newHaiku.line1)}-{countSyllables(newHaiku.line2)}-{countSyllables(newHaiku.line3)}
                        {isValidHaikuStructure(newHaiku.line1, newHaiku.line2, newHaiku.line3) ? ' ✅' : ' (Traditional: 5-7-5)'}
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={mintHaiku}
                    disabled={!newHaiku.line1 || !newHaiku.line2 || !newHaiku.line3 || isLoading}
                    className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Minting NFT...</span>
                      </div>
                    ) : (
                      '✍️ Mint Haiku NFT'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">🖼️ My Haiku Gallery</h3>
                <button
                  onClick={loadUserHaikus}
                  disabled={isLoading}
                  className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:opacity-50"
                >
                  🔄 Refresh
                </button>
              </div>
              
              {userHaikus.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600">You haven't created any haiku NFTs yet.</p>
                  <p className="text-sm text-gray-500 mt-2">Start writing your first haiku in the Mint tab!</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {userHaikus.map((haiku, index) => {
                    const syllables = getHaikuSyllableCounts(haiku)
                    return (
                      <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="text-center mb-4">
                              <div className="text-lg leading-relaxed text-gray-800 space-y-1">
                                <p className="italic">{haiku.line1}</p>
                                <p className="italic">{haiku.line2}</p>
                                <p className="italic">{haiku.line3}</p>
                              </div>
                              <div className="mt-3 text-xs text-gray-500">
                                Syllables: {syllables[0]}-{syllables[1]}-{syllables[2]}
                                {syllables[0] === 5 && syllables[1] === 7 && syllables[2] === 5 && (
                                  <span className="ml-2 text-green-600">✅ Traditional</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Author: {formatAddress(haiku.author)}</p>
                              <p>Token ID: #{haiku.id}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Share functionality */}
                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-medium text-gray-800 mb-2">💝 Share this Haiku</h4>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="Address to share with..."
                              value={shareInputs.toAddress}
                              onChange={(e) => setShareInputs(prev => ({ ...prev, toAddress: e.target.value, haikuId: haiku.id.toString() }))}
                              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            />
                            <button
                              onClick={shareHaiku}
                              disabled={!shareInputs.toAddress || isLoading}
                              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 text-sm"
                            >
                              Share
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Shared Tab */}
          {activeTab === 'shared' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">💝 Haikus Shared with Me</h3>
                <button
                  onClick={loadSharedHaikus}
                  disabled={isLoading}
                  className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:opacity-50"
                >
                  🔄 Refresh
                </button>
              </div>
              
              {sharedHaikus.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600">No haikus have been shared with you yet.</p>
                  <p className="text-sm text-gray-500 mt-2">Ask friends to share their beautiful poetry!</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {sharedHaikus.map((haiku, index) => {
                    const syllables = getHaikuSyllableCounts(haiku)
                    return (
                      <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border">
                        <div className="text-center mb-4">
                          <div className="text-lg leading-relaxed text-gray-800 space-y-1">
                            <p className="italic">{haiku.line1}</p>
                            <p className="italic">{haiku.line2}</p>
                            <p className="italic">{haiku.line3}</p>
                          </div>
                          <div className="mt-3 text-xs text-gray-500">
                            Syllables: {syllables[0]}-{syllables[1]}-{syllables[2]}
                            {syllables[0] === 5 && syllables[1] === 7 && syllables[2] === 5 && (
                              <span className="ml-2 text-green-600">✅ Traditional</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 text-center">
                          <p>Shared by: {formatAddress(haiku.author)}</p>
                          <p className="text-xs text-blue-600 mt-1">💝 Shared with love</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 NFT Collection Statistics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded p-4 border">
                    <h4 className="font-medium text-gray-800 mb-2">Collection Overview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Haikus Minted:</span>
                        <span className="font-mono">{formatNumber(nftStats.totalHaikus)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Your NFTs:</span>
                        <span className="font-mono">{formatNumber(nftStats.userNFTs)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Token ID:</span>
                        <span className="font-mono">#{nftStats.nextTokenId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shared with You:</span>
                        <span className="font-mono">{sharedHaikus.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded p-4 border">
                    <h4 className="font-medium text-gray-800 mb-2">Your Contribution</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Ownership Share:</span>
                        <span className="font-mono">
                          {nftStats.totalHaikus !== '0' 
                            ? ((parseInt(nftStats.userNFTs) / parseInt(nftStats.totalHaikus)) * 100).toFixed(1) + '%'
                            : '0%'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Traditional Haikus:</span>
                        <span className="font-mono">
                          {userHaikus.filter(h => {
                            const s = getHaikuSyllableCounts(h)
                            return s[0] === 5 && s[1] === 7 && s[2] === 5
                          }).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Creative Form:</span>
                        <span className="font-mono">
                          {userHaikus.filter(h => {
                            const s = getHaikuSyllableCounts(h)
                            return !(s[0] === 5 && s[1] === 7 && s[2] === 5)
                          }).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result !== null && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Transaction Result:</h4>
              <div className="bg-white rounded p-3 font-mono text-sm max-h-40 overflow-auto">
                {typeof result === 'object' ? JSON.stringify(result, null, 2) : result.toString()}
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
            <h3 className="font-medium text-gray-800 mb-2">🔧 HaikuNFT Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>ERC-721 NFTs:</strong> Each haiku is a unique, transferable NFT</li>
              <li>• <strong>Uniqueness Validation:</strong> No line can be reused across all haikus</li>
              <li>• <strong>Sharing System:</strong> Share your haikus with specific addresses</li>
              <li>• <strong>Syllable Counter:</strong> Automatic syllable counting for traditional 5-7-5 structure</li>
              <li>• <strong>Author Attribution:</strong> Permanent record of haiku authorship</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
