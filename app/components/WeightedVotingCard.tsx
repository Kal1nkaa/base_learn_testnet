'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

const WEIGHTED_VOTING_ADDRESS = '0x5782C363c12f4A486d3e9e0284441A0AEc69fa03' as const

const WEIGHTED_VOTING_ABI = [
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
    "name": "maxSupply",
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
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
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
    "inputs": [{"internalType": "address", "name": "_address", "type": "address"}],
    "name": "hasClaimedTokens",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
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
    "inputs": [
      {"internalType": "string", "name": "_description", "type": "string"},
      {"internalType": "uint256", "name": "_quorum", "type": "uint256"}
    ],
    "name": "createIssue",
    "outputs": [{"internalType": "uint256", "name": "issueId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
    "name": "getIssue",
    "outputs": [
      {
        "components": [
          {"internalType": "address[]", "name": "voters", "type": "address[]"},
          {"internalType": "string", "name": "issueDesc", "type": "string"},
          {"internalType": "uint256", "name": "votesFor", "type": "uint256"},
          {"internalType": "uint256", "name": "votesAgainst", "type": "uint256"},
          {"internalType": "uint256", "name": "votesAbstain", "type": "uint256"},
          {"internalType": "uint256", "name": "totalVotes", "type": "uint256"},
          {"internalType": "uint256", "name": "quorum", "type": "uint256"},
          {"internalType": "bool", "name": "passed", "type": "bool"},
          {"internalType": "bool", "name": "closed", "type": "bool"}
        ],
        "internalType": "struct WeightedVoting.IssueView",
        "name": "issueView",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getIssueCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_issueId", "type": "uint256"},
      {"internalType": "uint8", "name": "_vote", "type": "uint8"}
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

interface TokenStats {
  maxSupply: string
  totalSupply: string
  remainingTokens: string
  userBalance: string
  userHasClaimed: boolean
  issueCount: string
}

interface Issue {
  id: number
  voters: string[]
  issueDesc: string
  votesFor: string
  votesAgainst: string
  votesAbstain: string
  totalVotes: string
  quorum: string
  passed: boolean
  closed: boolean
}

enum VoteChoice {
  AGAINST = 0,
  FOR = 1,
  ABSTAIN = 2
}

export default function WeightedVotingCard() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'claim' | 'create' | 'vote' | 'stats'>('claim')
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Token stats
  const [tokenStats, setTokenStats] = useState<TokenStats>({
    maxSupply: '0',
    totalSupply: '0',
    remainingTokens: '0',
    userBalance: '0',
    userHasClaimed: false,
    issueCount: '0'
  })
  
  // Issues
  const [issues, setIssues] = useState<Issue[]>([])
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null)
  
  // Create issue inputs
  const [newIssue, setNewIssue] = useState({
    description: '',
    quorum: ''
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
          address: WEIGHTED_VOTING_ADDRESS,
          abi: WEIGHTED_VOTING_ABI,
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
        maxSupply,
        totalSupply,
        remainingTokens,
        userBalance,
        userHasClaimed,
        issueCount
      ] = await Promise.all([
        callContract('maxSupply', []),
        callContract('totalSupply', []),
        callContract('remainingTokens', []),
        callContract('balanceOf', [address]),
        callContract('hasClaimedTokens', [address]),
        callContract('getIssueCount', [])
      ])

      setTokenStats({
        maxSupply: maxSupply?.toString() || '0',
        totalSupply: totalSupply?.toString() || '0',
        remainingTokens: remainingTokens?.toString() || '0',
        userBalance: userBalance?.toString() || '0',
        userHasClaimed: userHasClaimed || false,
        issueCount: issueCount?.toString() || '0'
      })
    } catch (err) {
      console.error('Error loading token stats:', err)
    }
  }

  const loadIssues = async () => {
    if (!isConnected) return
    
    try {
      const issueCount = parseInt(tokenStats.issueCount)
      const issuePromises = []
      
      // Start from 1 (skip burned zeroeth element)
      for (let i = 1; i < issueCount; i++) {
        issuePromises.push(callContract('getIssue', [i]))
      }
      
      const issueResults = await Promise.all(issuePromises)
      const formattedIssues: Issue[] = issueResults.map((issue, index) => ({
        id: index + 1,
        voters: issue?.voters || [],
        issueDesc: issue?.issueDesc || '',
        votesFor: issue?.votesFor?.toString() || '0',
        votesAgainst: issue?.votesAgainst?.toString() || '0',
        votesAbstain: issue?.votesAbstain?.toString() || '0',
        totalVotes: issue?.totalVotes?.toString() || '0',
        quorum: issue?.quorum?.toString() || '0',
        passed: issue?.passed || false,
        closed: issue?.closed || false
      }))
      
      setIssues(formattedIssues)
    } catch (err) {
      console.error('Error loading issues:', err)
    }
  }

  const claimTokens = async () => {
    const result = await callContract('claim', [])
    if (result !== null) {
      await loadTokenStats()
    }
  }

  const createIssue = async () => {
    if (!newIssue.description || !newIssue.quorum) return
    
    const result = await callContract('createIssue', [
      newIssue.description,
      BigInt(newIssue.quorum).toString()
    ])
    
    if (result !== null) {
      setNewIssue({ description: '', quorum: '' })
      await loadTokenStats()
      await loadIssues()
    }
  }

  const voteOnIssue = async (issueId: number, vote: VoteChoice) => {
    const result = await callContract('vote', [issueId, vote])
    
    if (result !== null) {
      await loadIssues()
      await loadTokenStats()
    }
  }

  // Auto-load data when connected
  useEffect(() => {
    if (isConnected && address) {
      loadTokenStats()
    }
  }, [isConnected, address])

  useEffect(() => {
    if (tokenStats.issueCount !== '0') {
      loadIssues()
    }
  }, [tokenStats.issueCount])

  const formatNumber = (num: string) => {
    return parseInt(num).toLocaleString()
  }

  const getVoteChoiceLabel = (choice: VoteChoice) => {
    switch (choice) {
      case VoteChoice.AGAINST: return '❌ Against'
      case VoteChoice.FOR: return '✅ For'
      case VoteChoice.ABSTAIN: return '⚪ Abstain'
    }
  }

  const getVoteChoiceColor = (choice: VoteChoice) => {
    switch (choice) {
      case VoteChoice.AGAINST: return 'bg-red-500 hover:bg-red-600'
      case VoteChoice.FOR: return 'bg-green-500 hover:bg-green-600'
      case VoteChoice.ABSTAIN: return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const calculateVotePercentage = (votes: string, total: string) => {
    const v = parseInt(votes)
    const t = parseInt(total)
    return t > 0 ? ((v / t) * 100).toFixed(1) : '0'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">WeightedVoting - ERC-20 DAO Governance</h2>
        <div className="text-sm text-gray-500">
          <p>Contract: {WEIGHTED_VOTING_ADDRESS === '0xa3E3f539f0Ae7c278D870C0C671A8d4Fba322d1e' ? 'Not Deployed' : `${WEIGHTED_VOTING_ADDRESS.slice(0, 6)}...${WEIGHTED_VOTING_ADDRESS.slice(-4)}`}</p>
          <p>Network: Base Sepolia</p>
        </div>
      </div>

      {WEIGHTED_VOTING_ADDRESS === '0xa3E3f539f0Ae7c278D870C0C671A8d4Fba322d1e' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-yellow-600">⚠️</div>
            <p className="ml-2 text-yellow-800">
              Contract not yet deployed. Please deploy the WeightedVoting contract first.
            </p>
          </div>
        </div>
      )}
      
      {!isConnected ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please connect your wallet to participate in governance</p>
          <appkit-button />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Token Overview */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">🏛️ Your Governance Power</h3>
              <button
                onClick={loadTokenStats}
                disabled={isLoading}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
              >
                🔄 Refresh
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{formatNumber(tokenStats.userBalance)}</p>
                <p className="text-sm text-gray-600">Your Tokens</p>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{tokenStats.userHasClaimed ? '✅' : '❌'}</p>
                <p className="text-sm text-gray-600">Claimed</p>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{formatNumber(tokenStats.totalSupply)}</p>
                <p className="text-sm text-gray-600">Total Supply</p>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">{formatNumber(tokenStats.remainingTokens)}</p>
                <p className="text-sm text-gray-600">Remaining</p>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <p className="text-2xl font-bold text-indigo-600">{parseInt(tokenStats.issueCount) - 1}</p>
                <p className="text-sm text-gray-600">Active Issues</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 border-b border-gray-200">
            {[
              { key: 'claim', label: '🎯 Claim Tokens', desc: 'Get voting power' },
              { key: 'create', label: '📝 Create Issue', desc: 'Propose new votes' },
              { key: 'vote', label: '🗳️ Vote', desc: 'Cast your votes' },
              { key: 'stats', label: '📊 Statistics', desc: 'View governance data' }
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
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Claim Governance Tokens</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Claim 100 WV tokens to participate in governance. Each address can claim once.
                </p>
                
                {tokenStats.userHasClaimed ? (
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-blue-600 text-2xl mr-3">✅</div>
                      <div>
                        <p className="font-semibold text-blue-800">Already Claimed!</p>
                        <p className="text-blue-700 text-sm">You have {formatNumber(tokenStats.userBalance)} voting tokens.</p>
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
                      '🎯 Claim 100 WV Tokens'
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Create Issue Tab */}
          {activeTab === 'create' && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Create New Issue</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create a new governance proposal. Only token holders can create issues.
                </p>
                
                {parseInt(tokenStats.userBalance) === 0 ? (
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                    <p className="text-yellow-800">You need tokens to create issues. Claim some tokens first!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Issue Description</label>
                      <textarea
                        placeholder="Describe the proposal..."
                        value={newIssue.description}
                        onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quorum (votes needed to close)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 150"
                        value={newIssue.quorum}
                        onChange={(e) => setNewIssue(prev => ({ ...prev, quorum: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Max: {formatNumber(tokenStats.totalSupply)} (total supply)
                      </p>
                    </div>
                    
                    <button
                      onClick={createIssue}
                      disabled={!newIssue.description || !newIssue.quorum || isLoading}
                      className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                      {isLoading ? '⏳ Creating...' : '📝 Create Issue'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vote Tab */}
          {activeTab === 'vote' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">🗳️ Active Issues</h3>
              
              {issues.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600">No issues available for voting.</p>
                  <p className="text-sm text-gray-500 mt-2">Create the first issue in the Create tab!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {issues.map((issue) => (
                    <div key={issue.id} className="bg-gray-50 rounded-lg p-6 border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-800">Issue #{issue.id}</h4>
                            {issue.closed && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                issue.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {issue.passed ? '✅ Passed' : '❌ Failed'}
                              </span>
                            )}
                            {!issue.closed && (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                🗳️ Voting Open
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 mb-3">{issue.issueDesc}</p>
                          
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-green-100 rounded p-3 text-center">
                              <p className="text-lg font-bold text-green-700">{formatNumber(issue.votesFor)}</p>
                              <p className="text-sm text-green-600">For ({calculateVotePercentage(issue.votesFor, issue.totalVotes)}%)</p>
                            </div>
                            <div className="bg-red-100 rounded p-3 text-center">
                              <p className="text-lg font-bold text-red-700">{formatNumber(issue.votesAgainst)}</p>
                              <p className="text-sm text-red-600">Against ({calculateVotePercentage(issue.votesAgainst, issue.totalVotes)}%)</p>
                            </div>
                            <div className="bg-gray-100 rounded p-3 text-center">
                              <p className="text-lg font-bold text-gray-700">{formatNumber(issue.votesAbstain)}</p>
                              <p className="text-sm text-gray-600">Abstain ({calculateVotePercentage(issue.votesAbstain, issue.totalVotes)}%)</p>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Total Votes: {formatNumber(issue.totalVotes)} / {formatNumber(issue.quorum)} (quorum)</p>
                            <p>Progress: {((parseInt(issue.totalVotes) / parseInt(issue.quorum)) * 100).toFixed(1)}%</p>
                            <p>Voters: {issue.voters.length}</p>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((parseInt(issue.totalVotes) / parseInt(issue.quorum)) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      {!issue.closed && parseInt(tokenStats.userBalance) > 0 && !issue.voters.includes(address || '') && (
                        <div className="flex space-x-2">
                          {Object.values(VoteChoice).filter(v => typeof v === 'number').map((choice) => (
                            <button
                              key={choice}
                              onClick={() => voteOnIssue(issue.id, choice as VoteChoice)}
                              disabled={isLoading}
                              className={`flex-1 px-4 py-2 rounded text-white font-medium transition-all disabled:opacity-50 ${
                                getVoteChoiceColor(choice as VoteChoice)
                              }`}
                            >
                              {getVoteChoiceLabel(choice as VoteChoice)}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {issue.voters.includes(address || '') && (
                        <div className="bg-blue-100 border border-blue-300 rounded p-3 text-center">
                          <p className="text-blue-800 font-medium">✅ You have already voted on this issue</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Governance Statistics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white rounded p-4 border">
                      <h4 className="font-medium text-gray-800 mb-2">Token Distribution</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Max Supply:</span>
                          <span className="font-mono">{formatNumber(tokenStats.maxSupply)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Supply:</span>
                          <span className="font-mono">{formatNumber(tokenStats.totalSupply)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Remaining:</span>
                          <span className="font-mono">{formatNumber(tokenStats.remainingTokens)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Distribution:</span>
                          <span className="font-mono">
                            {((parseInt(tokenStats.totalSupply) / parseInt(tokenStats.maxSupply)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded p-4 border">
                      <h4 className="font-medium text-gray-800 mb-2">Governance Activity</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Issues:</span>
                          <span className="font-mono">{parseInt(tokenStats.issueCount) - 1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Open Issues:</span>
                          <span className="font-mono">{issues.filter(i => !i.closed).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Closed Issues:</span>
                          <span className="font-mono">{issues.filter(i => i.closed).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Passed Issues:</span>
                          <span className="font-mono">{issues.filter(i => i.passed).length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Token distribution progress */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-800 mb-3">Token Distribution Progress</h4>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${(parseInt(tokenStats.totalSupply) / parseInt(tokenStats.maxSupply)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-sm text-gray-600 mt-2">
                    {formatNumber(tokenStats.totalSupply)} / {formatNumber(tokenStats.maxSupply)} tokens distributed
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
            <h3 className="font-medium text-gray-800 mb-2">🔧 WeightedVoting Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>ERC-20 Token:</strong> Full-featured governance token with 1M max supply</li>
              <li>• <strong>Weighted Voting:</strong> Vote with all your tokens, weight matters</li>
              <li>• <strong>Quorum System:</strong> Issues close when quorum is reached</li>
              <li>• <strong>Governance Proposals:</strong> Token holders can create and vote on issues</li>
              <li>• <strong>OpenZeppelin Integration:</strong> Uses EnumerableSet for voter tracking</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
