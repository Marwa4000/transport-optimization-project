import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Papa from 'papaparse'
import { Loader2, Plus, X, Upload, ChevronDown, Download, ArrowRight } from 'lucide-react'
import { optimizeAssignments } from '../services/api'
import type { Seller, Customer } from '../services/api'

interface NewSeller { seller_city: string; seller_state: string; price: string }
interface NewCustomer { customer_city: string; customer_state: string }

const emptySeller: NewSeller = { seller_city: '', seller_state: '', price: '' }
const emptyCustomer: NewCustomer = { customer_city: '', customer_state: '' }

const models = [
  { id: 'linear', label: 'Linear Regression' },
  { id: 'random_forest', label: 'Random Forest', recommended: true },
  { id: 'xgboost', label: 'XGBoost' },
]

export default function PredictionPage() {
  const navigate = useNavigate()
  const sellerFileRef = useRef<HTMLInputElement>(null)
  const customerFileRef = useRef<HTMLInputElement>(null)

  const [sellers, setSellers] = useState<Seller[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showAddSeller, setShowAddSeller] = useState(false)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [newSeller, setNewSeller] = useState<NewSeller>(emptySeller)
  const [newCustomer, setNewCustomer] = useState<NewCustomer>(emptyCustomer)
  const [selectedModel, setSelectedModel] = useState('random_forest')
  const [modelOpen, setModelOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [costMatrix, setCostMatrix] = useState<number[][] | null>(null)

  const addSeller = () => {
    if (!newSeller.seller_city || !newSeller.seller_state || !newSeller.price) return
    setSellers(prev => [...prev, { seller_city: newSeller.seller_city, seller_state: newSeller.seller_state, price: Number(newSeller.price) }])
    setNewSeller(emptySeller)
    setShowAddSeller(false)
  }

  const addCustomer = () => {
    if (!newCustomer.customer_city || !newCustomer.customer_state) return
    setCustomers(prev => [...prev, { customer_city: newCustomer.customer_city, customer_state: newCustomer.customer_state }])
    setNewCustomer(emptyCustomer)
    setShowAddCustomer(false)
  }

  const readSellerCSV = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (res) => {
        const parsed: Seller[] = []
        for (const row of res.data as Record<string, string>[]) {
          if (row.seller_city && row.seller_state && row.price) {
            parsed.push({ seller_city: row.seller_city, seller_state: row.seller_state, price: Number(row.price) })
          }
        }
        setSellers(prev => [...prev, ...parsed])
        if (sellerFileRef.current) sellerFileRef.current.value = ''
      }
    })
  }, [])

  const readCustomerCSV = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (res) => {
        const parsed: Customer[] = []
        for (const row of res.data as Record<string, string>[]) {
          if (row.customer_city && row.customer_state) {
            parsed.push({ customer_city: row.customer_city, customer_state: row.customer_state })
          }
        }
        setCustomers(prev => [...prev, ...parsed])
        if (customerFileRef.current) customerFileRef.current.value = ''
      }
    })
  }, [])

  const handlePredict = async () => {
    if (sellers.length === 0 || customers.length === 0) return
    setLoading(true); setError('')
    try {
      const result = await optimizeAssignments(sellers, customers, selectedModel)
      setCostMatrix(result.cost_matrix)
      localStorage.setItem('costMatrix', JSON.stringify(result.cost_matrix))
      localStorage.setItem('lastSellers', JSON.stringify(sellers))
      localStorage.setItem('lastCustomers', JSON.stringify(customers))
      localStorage.setItem('lastModel', selectedModel)
    } catch {
      setError('Prediction failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadMatrixCSV = () => {
    if (!costMatrix) return
    const header = 'Seller \\ Customer,' + customers.map(c => c.customer_city).join(',') + '\n'
    const rows = costMatrix.map((row, i) =>
      (sellers[i]?.seller_city ?? `Seller ${i + 1}`) + ',' + row.join(',')
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'cost_matrix.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const goToAssignment = () => {
    navigate('/assignment')
  }

  const canPredict = sellers.length > 0 && customers.length > 0
  const selectedModelObj = models.find(m => m.id === selectedModel)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Transport Cost Prediction</h2>
        <p className="text-gray-500">Add sellers and customers to generate the cost matrix.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SELLERS PANEL */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-800">Sellers</h3>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{sellers.length}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAddSeller(prev => !prev)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                <Plus className="w-4 h-4" /> Add
              </button>
              <button onClick={() => sellerFileRef.current?.click()} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <Upload className="w-4 h-4" /> CSV
              </button>
              <input ref={sellerFileRef} type="file" accept=".csv" onChange={readSellerCSV} className="hidden" />
            </div>
          </div>

          {showAddSeller && (
            <div className="mb-4 p-4 bg-emerald-50 rounded-xl space-y-3">
              <input placeholder="City" value={newSeller.seller_city} onChange={e => setNewSeller(p => ({ ...p, seller_city: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              <input placeholder="Region" value={newSeller.seller_state} onChange={e => setNewSeller(p => ({ ...p, seller_state: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              <input placeholder="Price (MAD)" type="number" value={newSeller.price} onChange={e => setNewSeller(p => ({ ...p, price: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              <button onClick={addSeller} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">Add</button>
            </div>
          )}

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {sellers.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No sellers added.</p>}
            {sellers.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-3">
                <div>
                  <p className="font-medium text-gray-800">{s.seller_city}</p>
                  <p className="text-sm text-gray-500">{s.seller_state} &middot; {s.price} MAD</p>
                </div>
                <button onClick={() => setSellers(prev => prev.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CUSTOMERS PANEL */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-800">Customers</h3>
              <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">{customers.length}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAddCustomer(prev => !prev)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                <Plus className="w-4 h-4" /> Add
              </button>
              <button onClick={() => customerFileRef.current?.click()} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <Upload className="w-4 h-4" /> CSV
              </button>
              <input ref={customerFileRef} type="file" accept=".csv" onChange={readCustomerCSV} className="hidden" />
            </div>
          </div>

          {showAddCustomer && (
            <div className="mb-4 p-4 bg-primary-50 rounded-xl space-y-3">
              <input placeholder="City" value={newCustomer.customer_city} onChange={e => setNewCustomer(p => ({ ...p, customer_city: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              <input placeholder="Region" value={newCustomer.customer_state} onChange={e => setNewCustomer(p => ({ ...p, customer_state: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              <p className="text-xs text-gray-400 italic">Distance, delivery time, and same-city flag are calculated automatically.</p>
              <button onClick={addCustomer} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">Add</button>
            </div>
          )}

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {customers.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No customers added.</p>}
            {customers.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-primary-50 rounded-xl px-4 py-3">
                <div>
                  <p className="font-medium text-gray-800">{c.customer_city}</p>
                  <p className="text-sm text-gray-500">{c.customer_state}</p>
                </div>
                <button onClick={() => setCustomers(prev => prev.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODEL SELECTOR DROPDOWN */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Prediction model</h3>
        <div className="relative inline-block w-full max-w-xs">
          <button
            onClick={() => setModelOpen(prev => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-xl text-sm bg-white hover:border-gray-400 transition-colors"
          >
            <span>{selectedModelObj?.label} {selectedModelObj?.recommended ? '(recommended)' : ''}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${modelOpen ? 'rotate-180' : ''}`} />
          </button>
          {modelOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
              {models.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setSelectedModel(m.id); setModelOpen(false) }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-primary-50 ${
                    selectedModel === m.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {m.label} {m.recommended ? <span className="text-xs text-primary-500 ml-1">(recommended)</span> : ''}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PREDICT BUTTON */}
      <div className="text-center">
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {!canPredict && !loading && (
          <p className="text-gray-400 text-sm mb-3">Add at least 1 seller and 1 customer.</p>
        )}
        <button
          onClick={handlePredict}
          disabled={!canPredict || loading}
          className="w-full max-w-xl bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-semibold py-4 rounded-xl text-lg transition-colors flex items-center justify-center gap-3 mx-auto"
        >
          {loading && <Loader2 className="w-6 h-6 animate-spin" />}
          {loading ? 'Computing...' : 'Run Prediction'}
        </button>
      </div>

      {/* POST-PREDICTION ACTIONS */}
      {costMatrix && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={downloadMatrixCSV} className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors">
            <Download className="w-4 h-4" /> Download CSV
          </button>
          <button onClick={goToAssignment} className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors">
            Continue to Assignment <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* COST MATRIX PREVIEW */}
      {costMatrix && costMatrix.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Predicted cost matrix (MAD)</h3>
          <table className="w-full text-xs text-center divide-y divide-x border border-gray-200">
            <thead>
              <tr className="divide-x divide-gray-200">
                <th className="px-3 py-2 bg-gray-50 text-gray-600 font-medium text-left w-32">Seller \ Customer</th>
                {customers.map((c, j) => (
                  <th key={j} className="px-3 py-2 bg-gray-50 text-gray-600 font-medium flex-1 min-w-[80px]">{c.customer_city}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {costMatrix.map((row, i) => (
                <tr key={i} className="divide-x divide-gray-200">
                  <td className="px-3 py-2 bg-gray-50 text-gray-600 font-medium text-left">{sellers[i]?.seller_city ?? `Seller ${i + 1}`}</td>
                  {row.map((cost, j) => (
                    <td key={j} className="px-3 py-2 font-medium text-gray-700">{cost.toFixed(1)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}