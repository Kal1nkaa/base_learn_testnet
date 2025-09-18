'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

// TODO: Replace with actual deployed contract address
const ADDRESS_BOOK_FACTORY_ADDRESS = '0xe48d2B536baf36af3a6b26C8223A39F970f6dfb5' as const

const ADDRESS_BOOK_FACTORY_ABI = [
  {
    "inputs": [],
    "name": "deploy",
    "outputs": [{"internalType": "address", "name": "addressBookAddress", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "getAddressBooksByOwner",
    "outputs": [{"internalType": "address[]", "name": "addressBooks", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllDeployedAddressBooks",
    "outputs": [{"internalType": "address[]", "name": "addressBooks", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDeployedCount",
    "outputs": [{"internalType": "uint256", "name": "count", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

const ADDRESS_BOOK_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_firstName", "type": "string"},
      {"internalType": "string", "name": "_lastName", "type": "string"},
      {"internalType": "uint256[]", "name": "_phoneNumbers", "type": "uint256[]"}
    ],
    "name": "addContact",
    "outputs": [{"internalType": "uint256", "name": "id", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
    "name": "deleteContact",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
    "name": "getContact",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "string", "name": "firstName", "type": "string"},
          {"internalType": "string", "name": "lastName", "type": "string"},
          {"internalType": "uint256[]", "name": "phoneNumbers", "type": "uint256[]"}
        ],
        "internalType": "struct AddressBook.Contact",
        "name": "contact",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllContacts",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "string", "name": "firstName", "type": "string"},
          {"internalType": "string", "name": "lastName", "type": "string"},
          {"internalType": "uint256[]", "name": "phoneNumbers", "type": "uint256[]"}
        ],
        "internalType": "struct AddressBook.Contact[]",
        "name": "allContacts",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContactCount",
    "outputs": [{"internalType": "uint256", "name": "count", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

interface Contact {
  id: string
  firstName: string
  lastName: string
  phoneNumbers: string[]
}

export default function AddressBookCard() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'factory' | 'manage'>('factory')
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Factory state
  const [userAddressBooks, setUserAddressBooks] = useState<string[]>([])
  const [selectedAddressBook, setSelectedAddressBook] = useState<string>('')
  
  // Contact management state
  const [contacts, setContacts] = useState<Contact[]>([])
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    phoneNumbers: ''
  })

  const callContract = async (contractAddress: string, abi: any[], functionName: string, args: any[]) => {
    if (!isConnected) return null
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: contractAddress,
          abi,
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

  const deployNewAddressBook = async () => {
    const result = await callContract(
      ADDRESS_BOOK_FACTORY_ADDRESS,
      ADDRESS_BOOK_FACTORY_ABI,
      'deploy',
      []
    )
    
    if (result) {
      await loadUserAddressBooks()
    }
  }

  const loadUserAddressBooks = async () => {
    if (!address) return
    
    const result = await callContract(
      ADDRESS_BOOK_FACTORY_ADDRESS,
      ADDRESS_BOOK_FACTORY_ABI,
      'getAddressBooksByOwner',
      [address]
    )
    
    if (result) {
      setUserAddressBooks(result)
      if (result.length > 0 && !selectedAddressBook) {
        setSelectedAddressBook(result[0])
      }
    }
  }

  const loadContacts = async () => {
    if (!selectedAddressBook) return
    
    const result = await callContract(
      selectedAddressBook,
      ADDRESS_BOOK_ABI,
      'getAllContacts',
      []
    )
    
    if (result) {
      const formattedContacts = result.map((contact: any) => ({
        id: contact.id.toString(),
        firstName: contact.firstName,
        lastName: contact.lastName,
        phoneNumbers: contact.phoneNumbers.map((num: any) => num.toString())
      }))
      setContacts(formattedContacts)
    }
  }

  const addContact = async () => {
    if (!selectedAddressBook || !newContact.firstName || !newContact.lastName) return
    
    const phoneNumbers = newContact.phoneNumbers
      .split(',')
      .map(num => num.trim())
      .filter(num => num)
      .map(num => BigInt(num).toString())
    
    const result = await callContract(
      selectedAddressBook,
      ADDRESS_BOOK_ABI,
      'addContact',
      [newContact.firstName, newContact.lastName, phoneNumbers]
    )
    
    if (result) {
      setNewContact({ firstName: '', lastName: '', phoneNumbers: '' })
      await loadContacts()
    }
  }

  const deleteContact = async (contactId: string) => {
    if (!selectedAddressBook) return
    
    const result = await callContract(
      selectedAddressBook,
      ADDRESS_BOOK_ABI,
      'deleteContact',
      [BigInt(contactId).toString()]
    )
    
    if (result !== null) {
      await loadContacts()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">AddressBook Factory & Management</h2>
        <div className="text-sm text-gray-500">
          <p>Factory: {ADDRESS_BOOK_FACTORY_ADDRESS === '0xe48d2B536baf36af3a6b26C8223A39F970f6dfb5' ? 'Not Deployed' : `${ADDRESS_BOOK_FACTORY_ADDRESS.slice(0, 6)}...${ADDRESS_BOOK_FACTORY_ADDRESS.slice(-4)}`}</p>
          <p>Network: Base Sepolia</p>
        </div>
      </div>

      {ADDRESS_BOOK_FACTORY_ADDRESS === '0xe48d2B536baf36af3a6b26C8223A39F970f6dfb5' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-yellow-600">⚠️</div>
            <p className="ml-2 text-yellow-800">
              Factory contract not yet deployed. Please deploy the AddressBookFactory first.
            </p>
          </div>
        </div>
      )}
      
      {!isConnected ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please connect your wallet to interact with the AddressBook system</p>
          <appkit-button />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-2 border-b border-gray-200">
            {[
              { key: 'factory', label: '🏭 Factory', desc: 'Deploy & manage AddressBooks' },
              { key: 'manage', label: '📇 Manage Contacts', desc: 'Add/remove contacts' }
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

          {/* Factory Tab */}
          {activeTab === 'factory' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🏭 AddressBook Factory</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Deploy your own AddressBook contract using the factory pattern. Each deployed AddressBook is owned by you and can store your personal contacts.
                </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={deployNewAddressBook}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {isLoading ? '⏳ Deploying...' : '🚀 Deploy New AddressBook'}
                  </button>
                  
                  <button
                    onClick={loadUserAddressBooks}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    🔄 Refresh My AddressBooks
                  </button>
                </div>
              </div>

              {/* User's AddressBooks */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">📚 Your AddressBooks ({userAddressBooks.length})</h4>
                {userAddressBooks.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No AddressBooks deployed yet. Deploy one above to get started!</p>
                ) : (
                  <div className="space-y-2">
                    {userAddressBooks.map((addressBookAddr, index) => (
                      <div key={addressBookAddr} className="flex items-center justify-between bg-white rounded p-3 border">
                        <div>
                          <p className="font-mono text-sm">{addressBookAddr}</p>
                          <p className="text-xs text-gray-500">AddressBook #{index + 1}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedAddressBook(addressBookAddr)
                            setActiveTab('manage')
                          }}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          Manage →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manage Contacts Tab */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              {!selectedAddressBook ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Please select an AddressBook to manage contacts</p>
                  <button
                    onClick={() => setActiveTab('factory')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Go to Factory Tab
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">📇 Managing AddressBook</h4>
                    <p className="font-mono text-sm text-gray-600">{selectedAddressBook}</p>
                    <div className="flex space-x-4 mt-3">
                      <button
                        onClick={loadContacts}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        🔄 Load Contacts
                      </button>
                      <select
                        value={selectedAddressBook}
                        onChange={(e) => setSelectedAddressBook(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      >
                        {userAddressBooks.map((addr, index) => (
                          <option key={addr} value={addr}>
                            AddressBook #{index + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Add New Contact */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">➕ Add New Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={newContact.firstName}
                        onChange={(e) => setNewContact(prev => ({ ...prev, firstName: e.target.value }))}
                        className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={newContact.lastName}
                        onChange={(e) => setNewContact(prev => ({ ...prev, lastName: e.target.value }))}
                        className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Phone Numbers (comma-separated)"
                        value={newContact.phoneNumbers}
                        onChange={(e) => setNewContact(prev => ({ ...prev, phoneNumbers: e.target.value }))}
                        className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={addContact}
                      disabled={!newContact.firstName || !newContact.lastName || isLoading}
                      className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? '⏳ Adding...' : '➕ Add Contact'}
                    </button>
                  </div>

                  {/* Contacts List */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">📋 Contacts ({contacts.length})</h4>
                    {contacts.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">No contacts found. Add some contacts above!</p>
                    ) : (
                      <div className="space-y-3">
                        {contacts.map((contact) => (
                          <div key={contact.id} className="bg-white rounded p-4 border">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-800">
                                  {contact.firstName} {contact.lastName}
                                </h5>
                                <p className="text-sm text-gray-600">ID: {contact.id}</p>
                                <div className="mt-2">
                                  <p className="text-sm font-medium text-gray-700">Phone Numbers:</p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {contact.phoneNumbers.map((phone, index) => (
                                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                        {phone}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => deleteContact(contact.id)}
                                disabled={isLoading}
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Results Display */}
          {result !== null && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Result:</h4>
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
            <h3 className="font-medium text-gray-800 mb-2">🔧 AddressBook System Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Factory Pattern:</strong> Deploy multiple AddressBook contracts on-demand using the <code>new</code> keyword</li>
              <li>• <strong>OpenZeppelin Ownable:</strong> Each AddressBook is owned by the deployer with access control</li>
              <li>• <strong>Contact Management:</strong> Add, delete, and view contacts with multiple phone numbers</li>
              <li>• <strong>Error Handling:</strong> Custom <code>ContactNotFound</code> error with proper ID validation</li>
              <li>• <strong>Gas Optimized:</strong> Efficient storage and retrieval of contact data</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
