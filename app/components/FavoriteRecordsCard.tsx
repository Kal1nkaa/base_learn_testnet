'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

const FAVORITE_RECORDS_ADDRESS = '0xb80674ba5c5a61dd2d046452d2baf43278baf3eb' as const
const FAVORITE_RECORDS_ABI = [
  {
    "inputs": [],
    "name": "getApprovedRecords",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserFavorites",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_albumName", "type": "string"}],
    "name": "isApprovedRecord",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}, {"internalType": "string", "name": "_albumName", "type": "string"}],
    "name": "isUserFavorite",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserFavoritesCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getApprovedRecordsCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_albumName", "type": "string"}],
    "name": "addRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_albumName", "type": "string"}],
    "name": "removeRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetUserFavorites",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "", "type": "string"}],
    "name": "approvedRecords",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export default function FavoriteRecordsCard() {
  const { isConnected, address } = useAccount()
  const [approvedRecords, setApprovedRecords] = useState<string[]>([])
  const [userFavorites, setUserFavorites] = useState<string[]>([])
  const [searchAddress, setSearchAddress] = useState('')
  const [searchedUserFavorites, setSearchedUserFavorites] = useState<string[]>([])
  const [customAlbumInput, setCustomAlbumInput] = useState('')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadApprovedRecords = async () => {
    setIsLoading('approved')
    setError(null)
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: FAVORITE_RECORDS_ADDRESS,
          abi: FAVORITE_RECORDS_ABI,
          functionName: 'getApprovedRecords',
          args: []
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setApprovedRecords(data.result || [])
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Load approved records error:', error)
      setError('Failed to load approved records')
    } finally {
      setIsLoading(null)
    }
  }

  const loadUserFavorites = async () => {
    if (!isConnected || !address) return

    setIsLoading('favorites')
    setError(null)
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: FAVORITE_RECORDS_ADDRESS,
          abi: FAVORITE_RECORDS_ABI,
          functionName: 'getUserFavorites',
          args: [address]
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setUserFavorites(data.result || [])
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Load user favorites error:', error)
      setError('Failed to load user favorites')
    } finally {
      setIsLoading(null)
    }
  }

  const handleSearchUserFavorites = async () => {
    if (!searchAddress) return

    setIsLoading('search')
    setError(null)
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: FAVORITE_RECORDS_ADDRESS,
          abi: FAVORITE_RECORDS_ABI,
          functionName: 'getUserFavorites',
          args: [searchAddress]
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSearchedUserFavorites(data.result || [])
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Search user favorites error:', error)
      setError('Failed to search user favorites')
    } finally {
      setIsLoading(null)
    }
  }

  const handleAddRecord = async (albumName: string) => {
    if (!isConnected) return

    setIsLoading('add')
    setError(null)
    setSuccessMessage(null)
    try {
      // Note: This would require a write operation, which needs wallet transaction
      setSuccessMessage(`Would add "${albumName}" to favorites (requires wallet transaction)`)
      
      // Refresh user favorites after addition
      setTimeout(() => loadUserFavorites(), 1000)
    } catch (error: any) {
      console.error('Add record error:', error)
      setError(error.message || 'Failed to add record')
    } finally {
      setIsLoading(null)
    }
  }

  const handleRemoveRecord = async (albumName: string) => {
    if (!isConnected) return

    setIsLoading('remove')
    setError(null)
    setSuccessMessage(null)
    try {
      // Note: This would require a write operation
      setSuccessMessage(`Would remove "${albumName}" from favorites (requires wallet transaction)`)
      
      // Refresh user favorites after removal
      setTimeout(() => loadUserFavorites(), 1000)
    } catch (error: any) {
      console.error('Remove record error:', error)
      setError(error.message || 'Failed to remove record')
    } finally {
      setIsLoading(null)
    }
  }

  const handleResetFavorites = async () => {
    if (!isConnected) return

    setIsLoading('reset')
    setError(null)
    setSuccessMessage(null)
    try {
      // Note: This would require a write operation
      setSuccessMessage('Would reset all favorites (requires wallet transaction)')
      
      // Refresh user favorites after reset
      setTimeout(() => loadUserFavorites(), 1000)
    } catch (error) {
      console.error('Reset favorites error:', error)
      setError('Failed to reset favorites')
    } finally {
      setIsLoading(null)
    }
  }

  const handleAddCustomRecord = async () => {
    if (!customAlbumInput) return

    setIsLoading('custom')
    setError(null)
    setSuccessMessage(null)
    try {
      // First check if it's approved
      const checkResponse = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: FAVORITE_RECORDS_ADDRESS,
          abi: FAVORITE_RECORDS_ABI,
          functionName: 'isApprovedRecord',
          args: [customAlbumInput]
        })
      })

      const checkData = await checkResponse.json()
      
      if (checkData.success && checkData.result) {
        setSuccessMessage(`Would add "${customAlbumInput}" to favorites (requires wallet transaction)`)
        setCustomAlbumInput('')
      } else {
        setError(`"${customAlbumInput}" is not in the approved records list`)
      }
    } catch (error: any) {
      console.error('Add custom record error:', error)
      setError(error.message || 'Failed to add custom record')
    } finally {
      setIsLoading(null)
    }
  }

  const isUserFavorite = (albumName: string) => {
    return userFavorites.includes(albumName)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">FavoriteRecords Contract</h2>
        <div className="text-sm text-gray-500">
          <p>Contract: {FAVORITE_RECORDS_ADDRESS.slice(0, 6)}...{FAVORITE_RECORDS_ADDRESS.slice(-4)}</p>
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
          {/* Load Data Section */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">📀 Music Library</h3>
              <div className="flex space-x-2">
                <button
                  onClick={loadApprovedRecords}
                  disabled={isLoading === 'approved'}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading === 'approved' ? 'Loading...' : 'Load Approved'}
                </button>
                <button
                  onClick={loadUserFavorites}
                  disabled={isLoading === 'favorites'}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading === 'favorites' ? 'Loading...' : 'Load My Favorites'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Approved Records */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-3">🎵 Approved Records ({approvedRecords.length})</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {approvedRecords.length > 0 ? (
                    approvedRecords.map((album, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <span className="text-sm text-gray-800 font-medium">{album}</span>
                        <div className="flex space-x-2">
                          {isUserFavorite(album) ? (
                            <button
                              onClick={() => handleRemoveRecord(album)}
                              disabled={isLoading === 'remove'}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors disabled:opacity-50"
                            >
                              ❤️ Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddRecord(album)}
                              disabled={isLoading === 'add'}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors disabled:opacity-50"
                            >
                              🤍 Add
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-blue-600">Click "Load Approved" to see available records</p>
                  )}
                </div>
              </div>

              {/* User Favorites */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-green-800">❤️ My Favorites ({userFavorites.length})</h4>
                  {userFavorites.length > 0 && (
                    <button
                      onClick={handleResetFavorites}
                      disabled={isLoading === 'reset'}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors disabled:opacity-50"
                    >
                      Reset All
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {userFavorites.length > 0 ? (
                    userFavorites.map((album, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <span className="text-sm text-gray-800 font-medium">{album}</span>
                        <button
                          onClick={() => handleRemoveRecord(album)}
                          disabled={isLoading === 'remove'}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-green-600">No favorites yet. Add some from the approved list!</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Add Custom Record Section */}
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">➕ Add Custom Record</h3>
            <div className="flex space-x-4">
              <input
                type="text"
                value={customAlbumInput}
                onChange={(e) => setCustomAlbumInput(e.target.value)}
                placeholder="Enter album name (must be approved)"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading === 'custom'}
              />
              <button
                onClick={handleAddCustomRecord}
                disabled={!customAlbumInput || isLoading === 'custom'}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isLoading === 'custom' ? 'Checking...' : 'Add to Favorites'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Only albums from the approved list can be added. Try: "Thriller", "Back in Black", "Rumours", etc.
            </p>
          </div>

          {/* Search Other Users Section */}
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🔍 Search User Favorites</h3>
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Enter user address (0x...)"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading === 'search'}
              />
              <button
                onClick={handleSearchUserFavorites}
                disabled={!searchAddress || isLoading === 'search'}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isLoading === 'search' ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchedUserFavorites.length > 0 && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-medium text-indigo-800 mb-3">
                  User Favorites ({searchedUserFavorites.length}): {searchAddress.slice(0, 6)}...{searchAddress.slice(-4)}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {searchedUserFavorites.map((album, index) => (
                    <div key={index} className="bg-white rounded-lg p-2 text-sm text-gray-800">
                      {album}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contract Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Mapping Functions:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>approvedRecords:</strong> Public mapping checking if album is approved</li>
              <li>• <strong>userFavorites:</strong> Nested mapping tracking user's favorite albums</li>
              <li>• <strong>addRecord():</strong> Adds approved albums to user's favorites</li>
              <li>• <strong>getUserFavorites():</strong> Returns user's favorite albums array</li>
              <li>• <strong>resetUserFavorites():</strong> Clears user's favorite list</li>
              <li>• <strong>Custom Error:</strong> NotApproved() reverts for unapproved albums</li>
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
