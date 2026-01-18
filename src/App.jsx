import { useState } from 'react'
import CsvUploader from './components/CsvUploader'
import ScanInput from './components/ScanInput'
import Dashboard from './components/Dashboard'
import PendingList from './components/PendingList'

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleDataChange = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white py-4 px-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-center">Resi Checker</h1>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* Upload Section */}
        <CsvUploader onImportComplete={handleDataChange} />

        {/* Scan Section */}
        <ScanInput onScanComplete={handleDataChange} />

        {/* Dashboard Stats */}
        <Dashboard refreshTrigger={refreshTrigger} />

        {/* Pending Orders List */}
        <PendingList refreshTrigger={refreshTrigger} />
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 py-4">
        Resi Checker v1.0
      </footer>
    </div>
  )
}
