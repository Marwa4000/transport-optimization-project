import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Papa from 'papaparse'
import { ChevronDown, Upload, Play, AlertCircle } from 'lucide-react'
import type { Seller, Customer } from '../services/api'

const algorithms = [
  { id: 'hungarian', label: 'Hungarian Algorithm', desc: 'Optimal, O(n³)' },
  { id: 'greedy', label: 'Greedy', desc: 'Fast, heuristic' },
  { id: 'lp', label: 'Linear Programming', desc: 'Optimal with constraints' },
  { id: 'genetic', label: 'Genetic Algorithm', desc: 'Metaheuristic' },
]

export default function AssignmentPage() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [source, setSource] = useState<'predicted' | 'import'>('predicted')
  const [algorithm, setAlgorithm] = useState('hungarian')
  const [algoOpen, setAlgoOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const storedMatrix = localStorage.getItem('costMatrix')
  const parsedMatrix: number[][] | null = storedMatrix ? JSON.parse(storedMatrix) : null
  const sellers: Seller[] = JSON.parse(localStorage.getItem('lastSellers') || '[]')
  const customers: Customer[] = JSON.parse(localStorage.getItem('lastCustomers') || '[]')

  const [importedMatrix, setImportedMatrix] = useState<number[][] | null>(null)

  const costMatrix = source === 'predicted' ? parsedMatrix : importedMatrix
  const canRun = costMatrix !== null && costMatrix.length > 0

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    Papa.parse(file, {
      header: false, skipEmptyLines: true,
      complete: (res) => {
        const data = res.data as string[][]
        const matrix: number[][] = []
        for (const row of data) {
          const startIdx = isNaN(Number(row[0])) ? 1 : 0
          const parsed = row.slice(startIdx).map(v => Number(v)).filter(v => !isNaN(v))
          if (parsed.length > 0) matrix.push(parsed)
        }
        setImportedMatrix(matrix)
        localStorage.setItem('costMatrix', JSON.stringify(matrix))
        if (fileRef.current) fileRef.current.value = ''
      }
    })
  }

  const runAssignment = async () => {
    if (!costMatrix) return
    setLoading(true); setError('')
    try {
      const res = await fetch('http://localhost:8000/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cost_matrix: costMatrix, algorithm, sellers, customers }),
      })
      const result = await res.json()
      localStorage.setItem('assignmentResult', JSON.stringify(result))
      localStorage.setItem('selectedAlgorithm', algorithm)
      navigate('/results')
    } catch {
      setError('Server communication error.')
    } finally {
      setLoading(false)
    }
  }

  const selectedAlgo = algorithms.find(a => a.id === algorithm)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Optimal Assignment</h2>
        <p className="text-gray-500">Choose the cost matrix source and the assignment algorithm.</p>
      </div>

      {/* SECTION A — MATRIX SOURCE */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost matrix source</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setSource('predicted')}
            className={`rounded-xl p-4 text-left transition-colors ${
              source === 'predicted'
                ? 'border-2 border-primary-600 bg-primary-50 text-primary-700'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <p className="font-semibold">Predicted matrix</p>
            <p className="text-xs text-gray-400 mt-1">
              {parsedMatrix
                ? `${parsedMatrix.length} × ${parsedMatrix[0]?.length ?? 0} values loaded`
                : 'No matrix available'}
            </p>
          </button>
          <button
            onClick={() => setSource('import')}
            className={`rounded-xl p-4 text-left transition-colors ${
              source === 'import'
                ? 'border-2 border-primary-600 bg-primary-50 text-primary-700'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <p className="font-semibold">Upload my matrix</p>
            <p className="text-xs text-gray-400 mt-1">CSV file with costs</p>
          </button>
        </div>

        {source === 'predicted' && !parsedMatrix && (
          <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            No matrix available. Run a prediction first.
          </div>
        )}

        {source === 'import' && (
          <div className="mt-4">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl transition-colors"
            >
              <Upload className="w-4 h-4" /> Choose a CSV file
            </button>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            {importedMatrix && (
              <p className="text-sm text-primary-600 mt-2">
                {importedMatrix.length} × {importedMatrix[0]?.length ?? 0} values imported
              </p>
            )}
          </div>
        )}
      </div>

      {/* SECTION B — ALGORITHM SELECTOR */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Assignment algorithm</h3>
        <div className="relative inline-block w-full max-w-xs">
          <button
            onClick={() => setAlgoOpen(prev => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-xl text-sm bg-white hover:border-gray-400 transition-colors"
          >
            <div className="text-left">
              <p className="font-medium">{selectedAlgo?.label}</p>
              <p className="text-xs text-gray-400">{selectedAlgo?.desc}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${algoOpen ? 'rotate-180' : ''}`} />
          </button>
          {algoOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
              {algorithms.map(a => (
                <button
                  key={a.id}
                  onClick={() => { setAlgorithm(a.id); setAlgoOpen(false) }}
                  className={`w-full text-left px-4 py-3 transition-colors hover:bg-primary-50 ${
                    algorithm === a.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                  }`}
                >
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-xs text-gray-400">{a.desc}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RUN BUTTON */}
      <div className="text-center">
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {!canRun && (
          <p className="text-gray-400 text-sm mb-3">No cost matrix available.</p>
        )}
        <button
          onClick={runAssignment}
          disabled={!canRun || loading}
          className="w-full max-w-xl bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-semibold py-4 rounded-xl text-lg transition-colors flex items-center justify-center gap-3 mx-auto"
        >
          {loading ? (
            <span>Processing...</span>
          ) : (
            <><Play className="w-5 h-5" /> Run Assignment</>
          )}
        </button>
      </div>
    </div>
  )
}