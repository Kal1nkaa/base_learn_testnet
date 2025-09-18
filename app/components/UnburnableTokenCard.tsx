'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

// TODO: Replace with actual deployed contract address
const UNBURNABLE_TOKEN_ADDRESS = '0xF29b1FaAB24FF8681D909f26FC9b36E3D6d21d73' as const

const UNBURNABLE_TOKEN_ABI = [
  {
    "inputs": [],
    "name": "balances",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalClaimed",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "CLAIM_AMOUNT",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_to", "type": "address"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"}
    ],
    "name": "safeTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_address", "type": "address"}],
    "name": "hasClaimedTokens",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_address", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "remainingTokens",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalClaimers",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

interface TokenStats {
  totalSupply: string
  totalClaimed: string
  remainingTokens: string
  totalClaimers: string
  claimAmount: string
  userBalance: string
  userHasClaimed: boolean
}

export default function UnburnableTokenCard() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'claim' | 'transfer' | 'stats'>('claim')
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Token stats
  const [tokenStats, setTokenStats] = useState<TokenStats>({
    totalSupply: '0',
    totalClaimed: '0',
    remainingTokens: '0',
    totalClaimers: '0',
    claimAmount: '0',
    userBalance: '0',
    userHasClaimed: false
  })
  
  // Transfer inputs
  const [transferTo, setTransferTo] = useState('')
  const [transferAmount, setTransferAmount] = useState('')

  const callContract = async (functionName: string, args: any[]) => {
    if (!isConnected) return null
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: UNBURNABLE_TOKEN_ADDRESS,
          abi: UNBURNABLE_TOKEN_ABI,
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

  const loadTokenStats = async () => {
    if (!isConnected || !address) return
    
    try {
      const [
        totalSupply,
        totalClaimed,
        remainingTokens,
        totalClaimers,
        claimAmount,
        userBalance,
        userHasClaimed
      ] = await Promise.all([
        callContract('totalSupply', []),
        callContract('totalClaimed', []),
        callContract('remainingTokens', []),
        callContract('totalClaimers', []),
        callContract('CLAIM_AMOUNT', []),
        callContract('balanceOf', [address]),
        callContract('hasClaimedTokens', [address])
      ])

      setTokenStats({
        totalSupply: totalSupply?.toString() || '0',
        totalClaimed: totalClaimed?.toString() || '0',
        remainingTokens: remainingTokens?.toString() || '0',
        totalClaimers: totalClaimers?.toString() || '0',
        claimAmount: claimAmount?.toString() || '0',
        userBalance: userBalance?.toString() || '0',
        userHasClaimed: userHasClaimed || false
      })
    } catch (err) {
      console.error('Error loading token stats:', err)
    }
  }

  const claimTokens = async () => {
    const result = await callContract('claim', [])
    if (result !== null) {
      await loadTokenStats()
    }
  }

  const transferTokens = async () => {
    if (!transferTo || !transferAmount) return
    
    const result = await callContract('safeTransfer', [
      transferTo,
      BigInt(transferAmount).toString()
    ])
    
    if (result !== null) {
      setTransferTo('')
      setTransferAmount('')
      await loadTokenStats()
    }
  }

  // Auto-load stats when connected
  useEffect(() => {
    if (isConnected && address) {
      loadTokenStats()
    }
  }, [isConnected, address])

  const formatNumber = (num: string) => {
    return parseInt(num).toLocaleString()
  }

  const calculateProgress = () => {
    const claimed = parseInt(tokenStats.totalClaimed)
    const total = parseInt(tokenStats.totalSupply)
    return total > 0 ? (claimed / total) * 100 : 0
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">UnburnableToken - Minimal Token</h2>
        <div className="text-sm text-gray-500">
          <p>Contract: {UNBURNABLE_TOKEN_ADDRESS === '0xF29b1FaAB24FF8681D909f26FC9b36E3D6d21d73' ? 'Not Deployed' : `${UNBURNABLE_TOKEN_ADDRESS.slice(0, 6)}...${UNBURNABLE_TOKEN_ADDRESS.slice(-4)}`}</p>
          <p>Network: Base Sepolia</p>
        </div>
      </div>

      {UNBURNABLE_TOKEN_ADDRESS === '0xF29b1FaAB24FF8681D909f26FC9b36E3D6d21d73' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-yellow-600">⚠️</div>
            <p className="ml-2 text-yellow-800">
              Contract not yet deployed. Please deploy the UnburnableToken first.
            </p>
          </div>
        </div>
      )}
      
      {!isConnected ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please connect your wallet to interact with the token</p>
          <appkit-button />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Token Overview */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">🪙 Your Token Status</h3>
              <button
                onClick={loadTokenStats}
                disabled={isLoading}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
              >
                🔄 Refresh
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{formatNumber(tokenStats.userBalance)}</p>
                <p className="text-sm text-gray-600">Your Balance</p>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{tokenStats.userHasClaimed ? '✅' : '❌'}</p>
                <p className="text-sm text-gray-600">Claimed</p>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{formatNumber(tokenStats.claimAmount)}</p>
                <p className="text-sm text-gray-600">Claim Amount</p>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">{formatNumber(tokenStats.remainingTokens)}</p>
                <p className="text-sm text-gray-600">Remaining</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 border-b border-gray-200">
            {[
              { key: 'claim', label: '🎯 Claim Tokens', desc: 'Get your 1000 tokens' },
              { key: 'transfer', label: '💸 Safe Transfer', desc: 'Send tokens safely' },
              { key: 'stats', label: '📊 Token Stats', desc: 'View global statistics' }
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

          {/* Claim Tab */}
          {activeTab === 'claim' && (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Claim Your Tokens</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Each wallet can claim exactly 1000 tokens, but only once! Make sure you're ready before claiming.
                </p>
                
                {tokenStats.userHasClaimed ? (
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-blue-600 text-2xl mr-3">✅</div>
                      <div>
                        <p className="font-semibold text-blue-800">Already Claimed!</p>
                        <p className="text-blue-700 text-sm">You have successfully claimed your {formatNumber(tokenStats.claimAmount)} tokens.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={claimTokens}
                    disabled={isLoading}
                    className="w-full p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Claiming...</span>
                      </div>
                    ) : (
                      `🎯 Claim ${formatNumber(tokenStats.claimAmount)} Tokens`
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Transfer Tab */}
          {activeTab === 'transfer' && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">💸 Safe Transfer</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Transfer tokens safely. Recipients must have ETH balance > 0 and cannot be the zero address.
                </p>
                
                {parseInt(tokenStats.userBalance) === 0 ? (
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                    <p className="text-yellow-800">You need tokens to transfer. Claim some tokens first!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
                        <input
                          type="text"
                          placeholder="0x..."
                          value={transferTo}
                          onChange={(e) => setTransferTo(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                        <input
                          type="text"
                          placeholder="Amount to transfer"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={transferTokens}
                      disabled={!transferTo || !transferAmount || isLoading}
                      className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                      {isLoading ? '⏳ Transferring...' : '💸 Safe Transfer'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Global Token Statistics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white rounded p-4 border">
                      <h4 className="font-medium text-gray-800 mb-2">Supply Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Supply:</span>
                          <span className="font-mono">{formatNumber(tokenStats.totalSupply)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Claimed:</span>
                          <span className="font-mono">{formatNumber(tokenStats.totalClaimed)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Remaining:</span>
                          <span className="font-mono">{formatNumber(tokenStats.remainingTokens)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded p-4 border">
                      <h4 className="font-medium text-gray-800 mb-2">Claim Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Claimers:</span>
                          <span className="font-mono">{formatNumber(tokenStats.totalClaimers)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Claim Amount:</span>
                          <span className="font-mono">{formatNumber(tokenStats.claimAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded p-4 border">
                    <h4 className="font-medium text-gray-800 mb-4">Distribution Progress</h4>
                    <div className="space-y-3">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(calculateProgress(), 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-center text-sm text-gray-600">
                        {calculateProgress().toFixed(2)}% distributed
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        {formatNumber(tokenStats.totalClaimed)} / {formatNumber(tokenStats.totalSupply)} tokens claimed
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
              <div className="bg-white rounded p-3 font-mono text-sm">
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
            <h3 className="font-medium text-gray-800 mb-2">🔧 UnburnableToken Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>One-time Claim:</strong> Each address can claim exactly 1000 tokens once</li>
              <li>• <strong>Safe Transfer:</strong> Recipients must have ETH balance > 0 and valid address</li>
              <li>• <strong>Supply Tracking:</strong> 100M total supply with real-time distribution tracking</li>
              <li>• <strong>Custom Errors:</strong> <code>TokensClaimed</code>, <code>AllTokensClaimed</code>, <code>UnsafeTransfer</code></li>
              <li>• <strong>Gas Efficient:</strong> Optimized storage and minimal external calls</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
