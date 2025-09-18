'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

// Contract addresses from deployment
const SALESPERSON_ADDRESS = '0xaf78dd933c7b1dc30ca8cd708bccb3bd5a9d12aa' as const
const ENGINEERING_MANAGER_ADDRESS = '0x3ad53049dc7e424978906212de85038b849f3bcd' as const
const INHERITANCE_SUBMISSION_ADDRESS = '0xc151c006e93e3736d63227e99b52eead6fa8fb9e' as const

// ABIs for the contracts
const EMPLOYEE_ABI = [
  {
    "inputs": [],
    "name": "idNumber",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "managerId",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAnnualCost",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

const SALESPERSON_ABI = [
  ...EMPLOYEE_ABI,
  {
    "inputs": [],
    "name": "hourlyRate",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getEmployeeType",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

const ENGINEERING_MANAGER_ABI = [
  ...EMPLOYEE_ABI,
  {
    "inputs": [],
    "name": "annualSalary",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getEmployeeType",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getReportsCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getReports",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_employeeId", "type": "uint256"}],
    "name": "addReport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_engineerId", "type": "uint256"}],
    "name": "addEngineerReport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetReports",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalReportsCost",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

const INHERITANCE_SUBMISSION_ABI = [
  {
    "inputs": [],
    "name": "salesPerson",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "engineeringManager",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSalespersonInfo",
    "outputs": [{"internalType": "uint256", "name": "id", "type": "uint256"}, {"internalType": "uint256", "name": "managerId", "type": "uint256"}, {"internalType": "uint256", "name": "hourlyRate", "type": "uint256"}, {"internalType": "uint256", "name": "annualCost", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getEngineeringManagerInfo",
    "outputs": [{"internalType": "uint256", "name": "id", "type": "uint256"}, {"internalType": "uint256", "name": "managerId", "type": "uint256"}, {"internalType": "uint256", "name": "salary", "type": "uint256"}, {"internalType": "uint256", "name": "reportsCount", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "verifyInheritance",
    "outputs": [{"internalType": "bool", "name": "salespersonValid", "type": "bool"}, {"internalType": "bool", "name": "managerValid", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export default function InheritanceCard() {
  const { isConnected } = useAccount()
  const [newReportId, setNewReportId] = useState('')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Read Salesperson contract data
  const { data: salespersonId } = useReadContract({
    address: SALESPERSON_ADDRESS,
    abi: SALESPERSON_ABI,
    functionName: 'idNumber',
  })
  const { data: salespersonManagerId } = useReadContract({
    address: SALESPERSON_ADDRESS,
    abi: SALESPERSON_ABI,
    functionName: 'managerId',
  })
  const { data: salespersonHourlyRate } = useReadContract({
    address: SALESPERSON_ADDRESS,
    abi: SALESPERSON_ABI,
    functionName: 'hourlyRate',
  })
  const { data: salespersonAnnualCost } = useReadContract({
    address: SALESPERSON_ADDRESS,
    abi: SALESPERSON_ABI,
    functionName: 'getAnnualCost',
  })
  const { data: salespersonType } = useReadContract({
    address: SALESPERSON_ADDRESS,
    abi: SALESPERSON_ABI,
    functionName: 'getEmployeeType',
  })

  // Read EngineeringManager contract data
  const { data: managerId } = useReadContract({
    address: ENGINEERING_MANAGER_ADDRESS,
    abi: ENGINEERING_MANAGER_ABI,
    functionName: 'idNumber',
  })
  const { data: managerManagerId } = useReadContract({
    address: ENGINEERING_MANAGER_ADDRESS,
    abi: ENGINEERING_MANAGER_ABI,
    functionName: 'managerId',
  })
  const { data: managerSalary } = useReadContract({
    address: ENGINEERING_MANAGER_ADDRESS,
    abi: ENGINEERING_MANAGER_ABI,
    functionName: 'annualSalary',
  })
  const { data: managerAnnualCost } = useReadContract({
    address: ENGINEERING_MANAGER_ADDRESS,
    abi: ENGINEERING_MANAGER_ABI,
    functionName: 'getAnnualCost',
  })
  const { data: managerType } = useReadContract({
    address: ENGINEERING_MANAGER_ADDRESS,
    abi: ENGINEERING_MANAGER_ABI,
    functionName: 'getEmployeeType',
  })
  const { data: reportsCount, refetch: refetchReportsCount } = useReadContract({
    address: ENGINEERING_MANAGER_ADDRESS,
    abi: ENGINEERING_MANAGER_ABI,
    functionName: 'getReportsCount',
  })
  const { data: reports, refetch: refetchReports } = useReadContract({
    address: ENGINEERING_MANAGER_ADDRESS,
    abi: ENGINEERING_MANAGER_ABI,
    functionName: 'getReports',
  })
  const { data: totalReportsCost } = useReadContract({
    address: ENGINEERING_MANAGER_ADDRESS,
    abi: ENGINEERING_MANAGER_ABI,
    functionName: 'getTotalReportsCost',
  })

  // Read InheritanceSubmission contract data
  const { data: submissionSalesPersonAddr } = useReadContract({
    address: INHERITANCE_SUBMISSION_ADDRESS,
    abi: INHERITANCE_SUBMISSION_ABI,
    functionName: 'salesPerson',
  })
  const { data: submissionManagerAddr } = useReadContract({
    address: INHERITANCE_SUBMISSION_ADDRESS,
    abi: INHERITANCE_SUBMISSION_ABI,
    functionName: 'engineeringManager',
  })
  const { data: inheritanceVerification } = useReadContract({
    address: INHERITANCE_SUBMISSION_ADDRESS,
    abi: INHERITANCE_SUBMISSION_ABI,
    functionName: 'verifyInheritance',
  })

  // Write contract functions
  const { writeContract: writeAddReport, data: addReportHash } = useWriteContract()
  const { writeContract: writeResetReports, data: resetReportsHash } = useWriteContract()

  // Wait for transactions
  const { isLoading: isAddingConfirming, isSuccess: isAddingSuccess } = useWaitForTransactionReceipt({ hash: addReportHash })
  const { isLoading: isResettingConfirming, isSuccess: isResettingSuccess } = useWaitForTransactionReceipt({ hash: resetReportsHash })

  useEffect(() => {
    if (isAddingSuccess || isResettingSuccess) {
      refetchReportsCount()
      refetchReports()
      setError(null)
      setSuccessMessage('Transaction completed successfully!')
      setNewReportId('')
    }
  }, [isAddingSuccess, isResettingSuccess, refetchReportsCount, refetchReports])

  const handleAddReport = async () => {
    if (!newReportId || !isConnected) return
    setError(null)
    setSuccessMessage(null)
    try {
      const reportId = parseInt(newReportId)
      writeAddReport({
        address: ENGINEERING_MANAGER_ADDRESS,
        abi: ENGINEERING_MANAGER_ABI,
        functionName: 'addReport',
        args: [reportId as any],
      })
    } catch (e: any) {
      setError(e.message || 'Failed to add report')
    }
  }

  const handleResetReports = async () => {
    if (!isConnected) return
    setError(null)
    setSuccessMessage(null)
    try {
      writeResetReports({
        address: ENGINEERING_MANAGER_ADDRESS,
        abi: ENGINEERING_MANAGER_ABI,
        functionName: 'resetReports',
      })
    } catch (e: any) {
      setError(e.message || 'Failed to reset reports')
    }
  }

  const getInheritanceIcon = (contractType: string) => {
    switch (contractType) {
      case 'abstract': return '🧬'
      case 'employee': return '👤'
      case 'salaried': return '💼'
      case 'hourly': return '⏰'
      case 'manager': return '👔'
      case 'salesperson': return '🛒'
      case 'engineering-manager': return '⚙️'
      case 'submission': return '📋'
      default: return '🏢'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">🧬 Inheritance Exercise</h2>
        <div className="text-sm text-gray-500">
          <p>Contracts deployed on Base Sepolia</p>
          <p>Demonstrating: Abstract contracts, Virtual/Override, Multiple inheritance</p>
        </div>
      </div>

      {!isConnected ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please connect your wallet to interact with inheritance contracts</p>
          <appkit-button />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Inheritance Hierarchy Diagram */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🌳 Inheritance Hierarchy</h3>
            <div className="space-y-4">
              {/* Employee (Abstract) */}
              <div className="flex items-center space-x-4 p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">{getInheritanceIcon('abstract')}</span>
                <div>
                  <h4 className="font-semibold text-blue-800">Employee (Abstract)</h4>
                  <p className="text-sm text-blue-600">Base contract with idNumber, managerId, virtual getAnnualCost()</p>
                </div>
              </div>

              {/* Second Level */}
              <div className="ml-8 space-y-2">
                <div className="flex items-center space-x-4 p-3 bg-green-100 rounded-lg">
                  <span className="text-2xl">{getInheritanceIcon('salaried')}</span>
                  <div>
                    <h4 className="font-semibold text-green-800">Salaried extends Employee</h4>
                    <p className="text-sm text-green-600">Override: getAnnualCost() returns annualSalary</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-yellow-100 rounded-lg">
                  <span className="text-2xl">{getInheritanceIcon('hourly')}</span>
                  <div>
                    <h4 className="font-semibold text-yellow-800">Hourly extends Employee</h4>
                    <p className="text-sm text-yellow-600">Override: getAnnualCost() returns hourlyRate * 2080</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-purple-100 rounded-lg">
                  <span className="text-2xl">{getInheritanceIcon('manager')}</span>
                  <div>
                    <h4 className="font-semibold text-purple-800">Manager (Standalone)</h4>
                    <p className="text-sm text-purple-600">Employee management: addReport(), resetReports()</p>
                  </div>
                </div>
              </div>

              {/* Third Level */}
              <div className="ml-16 space-y-2">
                <div className="flex items-center space-x-4 p-3 bg-orange-100 rounded-lg">
                  <span className="text-2xl">{getInheritanceIcon('salesperson')}</span>
                  <div>
                    <h4 className="font-semibold text-orange-800">Salesperson extends Hourly</h4>
                    <p className="text-sm text-orange-600">Inherits hourly rate calculation + specific behavior</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-red-100 rounded-lg">
                  <span className="text-2xl">{getInheritanceIcon('engineering-manager')}</span>
                  <div>
                    <h4 className="font-semibold text-red-800">EngineeringManager extends Salaried, Manager</h4>
                    <p className="text-sm text-red-600">Multiple inheritance: salary + management capabilities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Salesperson Contract Details */}
          <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-orange-800">
                {getInheritanceIcon('salesperson')} Salesperson Contract
              </h3>
              <div className="text-sm text-orange-600">
                <p>Address: {SALESPERSON_ADDRESS.slice(0, 6)}...{SALESPERSON_ADDRESS.slice(-4)}</p>
                <p>Type: {salespersonType}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-800">Employee ID</h4>
                <p className="text-2xl font-bold text-orange-600">{salespersonId?.toString()}</p>
                <p className="text-sm text-gray-500">From Employee</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-800">Manager ID</h4>
                <p className="text-2xl font-bold text-orange-600">{salespersonManagerId?.toString()}</p>
                <p className="text-sm text-gray-500">From Employee</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-800">Hourly Rate</h4>
                <p className="text-2xl font-bold text-orange-600">${salespersonHourlyRate?.toString()}</p>
                <p className="text-sm text-gray-500">From Hourly</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-800">Annual Cost</h4>
                <p className="text-2xl font-bold text-orange-600">${salespersonAnnualCost?.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Override: rate × 2080</p>
              </div>
            </div>

            <div className="mt-4 bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Inheritance Chain:</h4>
              <p className="text-sm text-gray-600">
                Salesperson → Hourly → Employee (Abstract)
              </p>
              <p className="text-sm text-gray-600">
                Inherits: idNumber, managerId from Employee; hourlyRate from Hourly; overrides getAnnualCost()
              </p>
            </div>
          </div>

          {/* EngineeringManager Contract Details */}
          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-red-800">
                {getInheritanceIcon('engineering-manager')} EngineeringManager Contract
              </h3>
              <div className="text-sm text-red-600">
                <p>Address: {ENGINEERING_MANAGER_ADDRESS.slice(0, 6)}...{ENGINEERING_MANAGER_ADDRESS.slice(-4)}</p>
                <p>Type: {managerType}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-800">Employee ID</h4>
                <p className="text-2xl font-bold text-red-600">{managerId?.toString()}</p>
                <p className="text-sm text-gray-500">From Employee</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-800">Manager ID</h4>
                <p className="text-2xl font-bold text-red-600">{managerManagerId?.toString()}</p>
                <p className="text-sm text-gray-500">From Employee</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-800">Annual Salary</h4>
                <p className="text-2xl font-bold text-red-600">${managerSalary?.toLocaleString()}</p>
                <p className="text-sm text-gray-500">From Salaried</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-800">Annual Cost</h4>
                <p className="text-2xl font-bold text-red-600">${managerAnnualCost?.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Override: salary</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-800">Reports Count</h4>
                <p className="text-2xl font-bold text-red-600">{reportsCount?.toString()}</p>
                <p className="text-sm text-gray-500">From Manager</p>
              </div>
            </div>

            {/* Manager Functions */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-800 mb-3">👥 Team Management (Manager Functionality)</h4>
              <div className="flex space-x-4 mb-4">
                <input
                  type="number"
                  value={newReportId}
                  onChange={(e) => setNewReportId(e.target.value)}
                  placeholder="Employee ID to add"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={isAddingConfirming}
                />
                <button
                  onClick={handleAddReport}
                  disabled={!newReportId || isAddingConfirming}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isAddingConfirming ? 'Adding...' : 'Add Report'}
                </button>
                <button
                  onClick={handleResetReports}
                  disabled={isResettingConfirming || !reportsCount || reportsCount === 0n}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isResettingConfirming ? 'Resetting...' : 'Reset Reports'}
                </button>
              </div>
              
              {reports && reports.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Current Reports:</h5>
                  <div className="flex flex-wrap gap-2">
                    {reports.map((reportId, index) => (
                      <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                        ID: {reportId.toString()}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Total Reports Cost: ${totalReportsCost?.toLocaleString()} 
                    <span className="text-xs">(estimated at $100k per report)</span>
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Multiple Inheritance Chain:</h4>
              <p className="text-sm text-gray-600">
                EngineeringManager → Salaried + Manager → Employee (Abstract)
              </p>
              <p className="text-sm text-gray-600">
                Inherits: Employee properties, Salaried salary calculation, Manager team functions
              </p>
            </div>
          </div>

          {/* InheritanceSubmission Contract */}
          <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-indigo-800">
                {getInheritanceIcon('submission')} InheritanceSubmission Contract
              </h3>
              <div className="text-sm text-indigo-600">
                <p>Address: {INHERITANCE_SUBMISSION_ADDRESS.slice(0, 6)}...{INHERITANCE_SUBMISSION_ADDRESS.slice(-4)}</p>
                <p>Holds references to deployed contracts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Registered Contracts</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Salesperson:</span>
                    <span className="text-sm font-mono text-indigo-600">
                      {submissionSalesPersonAddr?.slice(0, 6)}...{submissionSalesPersonAddr?.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Engineering Manager:</span>
                    <span className="text-sm font-mono text-indigo-600">
                      {submissionManagerAddr?.slice(0, 6)}...{submissionManagerAddr?.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Inheritance Verification</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${inheritanceVerification?.[0] ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm">Salesperson Valid: {inheritanceVerification?.[0] ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${inheritanceVerification?.[1] ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm">Manager Valid: {inheritanceVerification?.[1] ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exercise Specifications Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">✅ Exercise Requirements Fulfilled:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h5 className="font-medium text-gray-800">Abstract Contract:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Employee with idNumber, managerId</li>
                  <li>Virtual getAnnualCost() function</li>
                  <li>Constructor with parameter setup</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-800">Inheritance Patterns:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Salaried overrides getAnnualCost()</li>
                  <li>Hourly implements 2080-hour calculation</li>
                  <li>Multiple inheritance in EngineeringManager</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-800">Deployed Values:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Salesperson: $20/hr, ID 55555, Manager 12345</li>
                  <li>Manager: $200k salary, ID 54321, Manager 11111</li>
                  <li>InheritanceSubmission with both addresses</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-800">Advanced Features:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Polymorphic function calls</li>
                  <li>Virtual/override function chain</li>
                  <li>Team management functionality</li>
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
