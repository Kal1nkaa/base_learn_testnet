'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

const GARAGE_MANAGER_ADDRESS = '0x91c24377f49059Eb4926D926F6cacFB34EE3Cc81' as const
const GARAGE_MANAGER_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
    "name": "BadCarIndex",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "index", "type": "uint256"}, {"indexed": false, "internalType": "string", "name": "make", "type": "string"}, {"indexed": false, "internalType": "string", "name": "model", "type": "string"}],
    "name": "CarAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "index", "type": "uint256"}, {"indexed": false, "internalType": "string", "name": "make", "type": "string"}, {"indexed": false, "internalType": "string", "name": "model", "type": "string"}],
    "name": "CarUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "carsRemoved", "type": "uint256"}],
    "name": "GarageReset",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "string", "name": "_make", "type": "string"}, {"internalType": "string", "name": "_model", "type": "string"}, {"internalType": "string", "name": "_color", "type": "string"}, {"internalType": "uint8", "name": "_numberOfDoors", "type": "uint8"}],
    "name": "addCar",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}, {"internalType": "string", "name": "_make", "type": "string"}],
    "name": "getCarsByMake",
    "outputs": [{"components": [{"internalType": "string", "name": "make", "type": "string"}, {"internalType": "string", "name": "model", "type": "string"}, {"internalType": "string", "name": "color", "type": "string"}, {"internalType": "uint8", "name": "numberOfDoors", "type": "uint8"}], "internalType": "struct GarageManager.Car[]", "name": "matchingCars", "type": "tuple[]"}, {"internalType": "uint256[]", "name": "indices", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyCar",
    "outputs": [{"components": [{"internalType": "string", "name": "make", "type": "string"}, {"internalType": "string", "name": "model", "type": "string"}, {"internalType": "string", "name": "color", "type": "string"}, {"internalType": "uint8", "name": "numberOfDoors", "type": "uint8"}], "internalType": "struct GarageManager.Car", "name": "", "type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyCarCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyCars",
    "outputs": [{"components": [{"internalType": "string", "name": "make", "type": "string"}, {"internalType": "string", "name": "model", "type": "string"}, {"internalType": "string", "name": "color", "type": "string"}, {"internalType": "uint8", "name": "numberOfDoors", "type": "uint8"}], "internalType": "struct GarageManager.Car[]", "name": "", "type": "tuple[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}, {"internalType": "uint256", "name": "_index", "type": "uint256"}],
    "name": "getUserCar",
    "outputs": [{"components": [{"internalType": "string", "name": "make", "type": "string"}, {"internalType": "string", "name": "model", "type": "string"}, {"internalType": "string", "name": "color", "type": "string"}, {"internalType": "uint8", "name": "numberOfDoors", "type": "uint8"}], "internalType": "struct GarageManager.Car", "name": "", "type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserCarCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserCarMakes",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserCars",
    "outputs": [{"components": [{"internalType": "string", "name": "make", "type": "string"}, {"internalType": "string", "name": "model", "type": "string"}, {"internalType": "string", "name": "color", "type": "string"}, {"internalType": "uint8", "name": "numberOfDoors", "type": "uint8"}], "internalType": "struct GarageManager.Car[]", "name": "", "type": "tuple[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}, {"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "garage",
    "outputs": [{"internalType": "string", "name": "make", "type": "string"}, {"internalType": "string", "name": "model", "type": "string"}, {"internalType": "string", "name": "color", "type": "string"}, {"internalType": "uint8", "name": "numberOfDoors", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "hasAnyCars",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_index", "type": "uint256"}],
    "name": "removeCar",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetMyGarage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_index", "type": "uint256"}, {"internalType": "string", "name": "_make", "type": "string"}, {"internalType": "string", "name": "_model", "type": "string"}, {"internalType": "string", "name": "_color", "type": "string"}, {"internalType": "uint8", "name": "_numberOfDoors", "type": "uint8"}],
    "name": "updateCar",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

interface Car {
  make: string
  model: string
  color: string
  numberOfDoors: number
}

export default function GarageManagerCard() {
  const { isConnected, address } = useAccount()
  const [userCars, setUserCars] = useState<Car[]>([])
  const [searchAddress, setSearchAddress] = useState('')
  const [searchedUserCars, setSearchedUserCars] = useState<Car[]>([])
  const [searchedUserCarCount, setSearchedUserCarCount] = useState(0)
  const [searchMake, setSearchMake] = useState('')
  const [makeSearchResults, setMakeSearchResults] = useState<{ cars: Car[], indices: number[] }>({ cars: [], indices: [] })
  
  // Add car form state
  const [newCar, setNewCar] = useState({
    make: '',
    model: '',
    color: '',
    numberOfDoors: 4
  })

  // Update car form state
  const [updateIndex, setUpdateIndex] = useState('')
  const [updateCar, setUpdateCar] = useState({
    make: '',
    model: '',
    color: '',
    numberOfDoors: 4
  })

  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Read contract data
  const { data: myCarCount, refetch: refetchMyCarCount } = useReadContract({
    address: GARAGE_MANAGER_ADDRESS,
    abi: GARAGE_MANAGER_ABI,
    functionName: 'getMyCarCount',
  })

  const { data: myCars, refetch: refetchMyCars } = useReadContract({
    address: GARAGE_MANAGER_ADDRESS,
    abi: GARAGE_MANAGER_ABI,
    functionName: 'getMyCars',
  })

  // Write contract functions
  const { writeContract: writeAddCar, data: addCarHash } = useWriteContract()
  const { writeContract: writeUpdateCar, data: updateCarHash } = useWriteContract()
  const { writeContract: writeRemoveCar, data: removeCarHash } = useWriteContract()
  const { writeContract: writeResetGarage, data: resetGarageHash } = useWriteContract()

  // Wait for transactions
  const { isLoading: isAddingConfirming, isSuccess: isAddingSuccess } = useWaitForTransactionReceipt({ hash: addCarHash })
  const { isLoading: isUpdatingConfirming, isSuccess: isUpdatingSuccess } = useWaitForTransactionReceipt({ hash: updateCarHash })
  const { isLoading: isRemovingConfirming, isSuccess: isRemovingSuccess } = useWaitForTransactionReceipt({ hash: removeCarHash })
  const { isLoading: isResettingConfirming, isSuccess: isResettingSuccess } = useWaitForTransactionReceipt({ hash: resetGarageHash })

  useEffect(() => {
    if (myCars) {
      setUserCars(myCars as Car[])
    }
  }, [myCars])

  useEffect(() => {
    if (isAddingSuccess || isUpdatingSuccess || isRemovingSuccess || isResettingSuccess) {
      refetchMyCars()
      refetchMyCarCount()
      setError(null)
      setSuccessMessage('Transaction completed successfully!')
      
      // Clear forms on success
      if (isAddingSuccess) {
        setNewCar({ make: '', model: '', color: '', numberOfDoors: 4 })
      }
      if (isUpdatingSuccess) {
        setUpdateIndex('')
        setUpdateCar({ make: '', model: '', color: '', numberOfDoors: 4 })
      }
    }
  }, [isAddingSuccess, isUpdatingSuccess, isRemovingSuccess, isResettingSuccess, refetchMyCars, refetchMyCarCount])

  const handleAddCar = async () => {
    if (!newCar.make || !newCar.model || !newCar.color || !isConnected) return
    setError(null)
    setSuccessMessage(null)
    try {
      writeAddCar({
        address: GARAGE_MANAGER_ADDRESS,
        abi: GARAGE_MANAGER_ABI,
        functionName: 'addCar',
        args: [newCar.make, newCar.model, newCar.color, newCar.numberOfDoors as any],
      })
    } catch (e: any) {
      setError(e.message || 'Failed to add car')
    }
  }

  const handleUpdateCar = async () => {
    if (!updateIndex || !updateCar.make || !updateCar.model || !updateCar.color || !isConnected) return
    setError(null)
    setSuccessMessage(null)
    try {
      const index = parseInt(updateIndex)
      writeUpdateCar({
        address: GARAGE_MANAGER_ADDRESS,
        abi: GARAGE_MANAGER_ABI,
        functionName: 'updateCar',
        args: [index as any, updateCar.make, updateCar.model, updateCar.color, updateCar.numberOfDoors as any],
      })
    } catch (e: any) {
      setError(e.message || 'Failed to update car')
    }
  }

  const handleRemoveCar = async (index: number) => {
    if (!isConnected) return
    setError(null)
    setSuccessMessage(null)
    try {
      writeRemoveCar({
        address: GARAGE_MANAGER_ADDRESS,
        abi: GARAGE_MANAGER_ABI,
        functionName: 'removeCar',
        args: [index as any],
      })
    } catch (e: any) {
      setError(e.message || 'Failed to remove car')
    }
  }

  const handleResetGarage = async () => {
    if (!isConnected) return
    setError(null)
    setSuccessMessage(null)
    try {
      writeResetGarage({
        address: GARAGE_MANAGER_ADDRESS,
        abi: GARAGE_MANAGER_ABI,
        functionName: 'resetMyGarage',
      })
    } catch (e: any) {
      setError(e.message || 'Failed to reset garage')
    }
  }

  const handleSearchUserCars = async () => {
    if (!searchAddress) return
    setIsLoading('search')
    setError(null)
    try {
      const countResponse = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: GARAGE_MANAGER_ADDRESS,
          abi: GARAGE_MANAGER_ABI,
          functionName: 'getUserCarCount',
          args: [searchAddress]
        })
      })

      const countData = await countResponse.json()
      
      if (countData.success) {
        setSearchedUserCarCount(parseInt(countData.result))
        
        if (parseInt(countData.result) > 0) {
          const carsResponse = await fetch('/api/contract-call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address: GARAGE_MANAGER_ADDRESS,
              abi: GARAGE_MANAGER_ABI,
              functionName: 'getUserCars',
              args: [searchAddress]
            })
          })

          const carsData = await carsResponse.json()
          if (carsData.success) {
            setSearchedUserCars(carsData.result)
          } else {
            throw new Error(carsData.error)
          }
        } else {
          setSearchedUserCars([])
        }
      } else {
        throw new Error(countData.error)
      }
    } catch (error) {
      console.error('Search user cars error:', error)
      setError('Failed to search user cars')
    } finally {
      setIsLoading(null)
    }
  }

  const handleSearchByMake = async () => {
    if (!searchMake || !searchAddress) return
    setIsLoading('make-search')
    setError(null)
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: GARAGE_MANAGER_ADDRESS,
          abi: GARAGE_MANAGER_ABI,
          functionName: 'getCarsByMake',
          args: [searchAddress, searchMake]
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setMakeSearchResults({
          cars: data.result[0] || [],
          indices: data.result[1] || []
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Search by make error:', error)
      setError('Failed to search cars by make')
    } finally {
      setIsLoading(null)
    }
  }

  const getCarEmoji = (make: string) => {
    const makeUpper = make.toUpperCase()
    if (makeUpper.includes('TESLA')) return '⚡'
    if (makeUpper.includes('BMW') || makeUpper.includes('MERCEDES') || makeUpper.includes('AUDI')) return '🏎️'
    if (makeUpper.includes('TOYOTA') || makeUpper.includes('HONDA')) return '🚗'
    if (makeUpper.includes('FORD') || makeUpper.includes('CHEVROLET')) return '🚙'
    if (makeUpper.includes('FERRARI') || makeUpper.includes('LAMBORGHINI') || makeUpper.includes('PORSCHE')) return '🏁'
    return '🚘'
  }

  const getDoorIcon = (doors: number) => {
    if (doors === 2) return '🚪🚪'
    if (doors === 4) return '🚪🚪🚪🚪'
    if (doors === 5) return '🚪🚪🚪🚪🚪'
    return `${doors} doors`
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">🚗 GarageManager Contract</h2>
        <div className="text-sm text-gray-500">
          <p>Contract: {GARAGE_MANAGER_ADDRESS.slice(0, 6)}...{GARAGE_MANAGER_ADDRESS.slice(-4)}</p>
          <p>Network: Base Sepolia</p>
        </div>
      </div>

      {!isConnected ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please connect your wallet to manage your garage</p>
          <appkit-button />
        </div>
      ) : (
        <div className="space-y-6">
          {/* My Garage Overview */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-blue-800">🏠 My Garage</h3>
              <div className="flex items-center space-x-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {myCarCount?.toString() || '0'} cars
                </span>
                {userCars.length > 0 && (
                  <button
                    onClick={handleResetGarage}
                    disabled={isResettingConfirming}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isResettingConfirming ? 'Resetting...' : 'Reset Garage'}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userCars.length > 0 ? (
                userCars.map((car, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{getCarEmoji(car.make)}</span>
                      <span className="text-xs text-gray-500">#{index}</span>
                    </div>
                    <h4 className="font-semibold text-gray-800">{car.make} {car.model}</h4>
                    <p className="text-sm text-gray-600">Color: {car.color}</p>
                    <p className="text-sm text-gray-600">{getDoorIcon(car.numberOfDoors)}</p>
                    <button
                      onClick={() => handleRemoveCar(index)}
                      disabled={isRemovingConfirming}
                      className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors disabled:opacity-50"
                    >
                      {isRemovingConfirming ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🏗️</div>
                  <p>Your garage is empty. Add your first car below!</p>
                </div>
              )}
            </div>
          </div>

          {/* Add New Car */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-xl font-semibold text-green-800 mb-4">➕ Add New Car</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                value={newCar.make}
                onChange={(e) => setNewCar({...newCar, make: e.target.value})}
                placeholder="Make (e.g., Toyota)"
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isAddingConfirming}
              />
              <input
                type="text"
                value={newCar.model}
                onChange={(e) => setNewCar({...newCar, model: e.target.value})}
                placeholder="Model (e.g., Camry)"
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isAddingConfirming}
              />
              <input
                type="text"
                value={newCar.color}
                onChange={(e) => setNewCar({...newCar, color: e.target.value})}
                placeholder="Color (e.g., Blue)"
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isAddingConfirming}
              />
              <select
                value={newCar.numberOfDoors}
                onChange={(e) => setNewCar({...newCar, numberOfDoors: parseInt(e.target.value)})}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isAddingConfirming}
              >
                <option value={2}>2 doors</option>
                <option value={4}>4 doors</option>
                <option value={5}>5 doors</option>
              </select>
            </div>
            <button
              onClick={handleAddCar}
              disabled={!newCar.make || !newCar.model || !newCar.color || isAddingConfirming}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isAddingConfirming ? 'Adding Car...' : 'Add Car to Garage'}
            </button>
          </div>

          {/* Update Car */}
          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
            <h3 className="text-xl font-semibold text-yellow-800 mb-4">✏️ Update Existing Car</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <input
                type="number"
                value={updateIndex}
                onChange={(e) => setUpdateIndex(e.target.value)}
                placeholder="Car Index"
                min="0"
                max={Math.max(0, userCars.length - 1)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                disabled={isUpdatingConfirming}
              />
              <input
                type="text"
                value={updateCar.make}
                onChange={(e) => setUpdateCar({...updateCar, make: e.target.value})}
                placeholder="New Make"
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                disabled={isUpdatingConfirming}
              />
              <input
                type="text"
                value={updateCar.model}
                onChange={(e) => setUpdateCar({...updateCar, model: e.target.value})}
                placeholder="New Model"
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                disabled={isUpdatingConfirming}
              />
              <input
                type="text"
                value={updateCar.color}
                onChange={(e) => setUpdateCar({...updateCar, color: e.target.value})}
                placeholder="New Color"
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                disabled={isUpdatingConfirming}
              />
              <select
                value={updateCar.numberOfDoors}
                onChange={(e) => setUpdateCar({...updateCar, numberOfDoors: parseInt(e.target.value)})}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                disabled={isUpdatingConfirming}
              >
                <option value={2}>2 doors</option>
                <option value={4}>4 doors</option>
                <option value={5}>5 doors</option>
              </select>
            </div>
            <button
              onClick={handleUpdateCar}
              disabled={!updateIndex || !updateCar.make || !updateCar.model || !updateCar.color || isUpdatingConfirming}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isUpdatingConfirming ? 'Updating Car...' : 'Update Car'}
            </button>
            {userCars.length > 0 && (
              <p className="text-sm text-yellow-700 mt-2">
                Valid indices: 0 to {userCars.length - 1}
              </p>
            )}
          </div>

          {/* Search Other Users */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-xl font-semibold text-purple-800 mb-4">🔍 Explore Other Garages</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Enter address (0x...)"
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading === 'search'}
              />
              <button
                onClick={handleSearchUserCars}
                disabled={!searchAddress || isLoading === 'search'}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isLoading === 'search' ? 'Searching...' : 'View Garage'}
              </button>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchMake}
                  onChange={(e) => setSearchMake(e.target.value)}
                  placeholder="Filter by make"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading === 'make-search'}
                />
                <button
                  onClick={handleSearchByMake}
                  disabled={!searchMake || !searchAddress || isLoading === 'make-search'}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading === 'make-search' ? '...' : 'Filter'}
                </button>
              </div>
            </div>

            {searchedUserCars.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-purple-800 mb-3">
                  Garage of {searchAddress.slice(0, 6)}...{searchAddress.slice(-4)} ({searchedUserCarCount} cars)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {searchedUserCars.map((car, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">{getCarEmoji(car.make)}</span>
                        <span className="text-xs text-gray-500">#{index}</span>
                      </div>
                      <h5 className="font-medium text-gray-800 text-sm">{car.make} {car.model}</h5>
                      <p className="text-xs text-gray-600">{car.color} • {getDoorIcon(car.numberOfDoors)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {makeSearchResults.cars.length > 0 && (
              <div>
                <h4 className="font-medium text-indigo-800 mb-3">
                  {searchMake} cars found ({makeSearchResults.cars.length} matches)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {makeSearchResults.cars.map((car, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border border-indigo-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">{getCarEmoji(car.make)}</span>
                        <span className="text-xs text-indigo-600">#{makeSearchResults.indices[idx]}</span>
                      </div>
                      <h5 className="font-medium text-gray-800 text-sm">{car.make} {car.model}</h5>
                      <p className="text-xs text-gray-600">{car.color} • {getDoorIcon(car.numberOfDoors)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contract Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Struct & Functions:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Car struct:</strong> {`{make, model, color, numberOfDoors}`}</li>
              <li>• <strong>garage mapping:</strong> address → Car[] (user's car collection)</li>
              <li>• <strong>addCar():</strong> Adds new car to caller's garage</li>
              <li>• <strong>updateCar():</strong> Updates existing car by index (reverts with BadCarIndex if invalid)</li>
              <li>• <strong>getMyCars():</strong> Returns caller's car array</li>
              <li>• <strong>getUserCars():</strong> Returns any user's car array</li>
              <li>• <strong>resetMyGarage():</strong> Deletes all caller's cars</li>
              <li>• <strong>removeCar():</strong> Removes car by index efficiently</li>
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
              <p className="font-semibold">Success:</p>
              <p>{successMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
