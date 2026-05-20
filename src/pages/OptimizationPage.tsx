import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Papa from 'papaparse'
import { Loader2, Plus, X, Upload } from 'lucide-react'
import { optimizeAssignments } from '../services/api'
import type { Seller, Customer } from '../services/api'

interface NewSeller { seller_city: string; seller_state: string; price: string }
interface NewCustomer { customer_city: string; customer_state: string }

const emptySeller: NewSeller = { seller_city: '', seller_state: '', price: '' }
const emptyCustomer: NewCustomer = { customer_city: '', customer_state: '' }

const models = [
  { id: 'linear', label: 'Linear Regression', description: 'Fast baseline model' },
  { id: 'random_forest', label: 'Random Forest', description: 'Best overall accuracy' },
  { id: 'xgboost', label: 'XGBoost', description: 'Gradient boosting' },
  { id: 'svr', label: 'SVR', description: 'Support Vector Regression' },
]

export default function OptimizationPage() {
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const handleOptimize = async () => {
    if (sellers.length === 0 || customers.length === 0) return
    setLoading(true); setError('')
    try {
      const result = await optimizeAssignments(sellers, customers, selectedModel)
      const record = { date: new Date().toISOString(), sellers: sellers.length, customers: customers.length, total_cost: result.total_cost, average_cost: result.average_cost, model: selectedModel }
      const raw = localStorage.getItem('optimizations')
      const list = raw ? JSON.parse(raw) : []
      list.push(record)
      localStorage.setItem('optimizations', JSON.stringify(list))
      localStorage.setItem('lastOptimization', JSON.stringify(result))
      localStorage.setItem('lastSellers', JSON.stringify(sellers))
      localStorage.setItem('lastCustomers', JSON.stringify(customers))
      localStorage.setItem('lastModel', selectedModel)
      navigate('/results')
    } catch {
      setError('Optimization failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canOptimize = sellers.length > 0 && customers.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Transport Assignment Optimization</h2>
        <p className="text-gray-500">Add sellers and customers, then find the optimal assignment.</p>
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
                <Plus className="w-4 h-4" /> Add Seller
              </button>
              <button onClick={() => sellerFileRef.current?.click()} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <Upload className="w-4 h-4" /> Import CSV
              </button>
              <input ref={sellerFileRef} type="file" accept=".csv" onChange={readSellerCSV} className="hidden" />
            </div>
          </div>

          {showAddSeller && (
            <div className="mb-4 p-4 bg-emerald-50 rounded-xl space-y-3">
              <input placeholder="Seller city" value={newSeller.seller_city} onChange={e => setNewSeller(p => ({ ...p, seller_city: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              <input placeholder="Seller state" value={newSeller.seller_state} onChange={e => setNewSeller(p => ({ ...p, seller_state: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              <input placeholder="Price (MAD)" type="number" value={newSeller.price} onChange={e => setNewSeller(p => ({ ...p, price: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              <button onClick={addSeller} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">Add</button>
            </div>
          )}

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {sellers.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No sellers added yet.</p>}
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
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{customers.length}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAddCustomer(prev => !prev)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Plus className="w-4 h-4" /> Add Customer
              </button>
              <button onClick={() => customerFileRef.current?.click()} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <Upload className="w-4 h-4" /> Import CSV
              </button>
              <input ref={customerFileRef} type="file" accept=".csv" onChange={readCustomerCSV} className="hidden" />
            </div>
          </div>

          {showAddCustomer && (
            <div className="mb-4 p-4 bg-blue-50 rounded-xl space-y-3">
              <input placeholder="Customer city" value={newCustomer.customer_city} onChange={e => setNewCustomer(p => ({ ...p, customer_city: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <input placeholder="Customer state" value={newCustomer.customer_state} onChange={e => setNewCustomer(p => ({ ...p, customer_state: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <p className="text-xs text-gray-400 italic">Distance, delivery time and same-city flag are computed automatically.</p>
              <button onClick={addCustomer} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">Add</button>
            </div>
          )}

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {customers.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No customers added yet.</p>}
            {customers.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
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

      {/* MODEL SELECTOR */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Prediction Model</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {models.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedModel(m.id)}
              className={`rounded-xl p-4 text-left transition-colors ${
                selectedModel === m.id
                  ? 'border-2 border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <p className="font-semibold">{m.label}</p>
              <p className="text-xs text-gray-400 mt-1">{m.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* OPTIMIZE BUTTON */}
      <div className="text-center">
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {!canOptimize && !loading && (
          <p className="text-gray-400 text-sm mb-3">Please add at least 1 seller and 1 customer.</p>
        )}
        <button
          onClick={handleOptimize}
          disabled={!canOptimize || loading}
          className="w-full max-w-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-4 rounded-xl text-lg transition-colors flex items-center justify-center gap-3 mx-auto"
        >
          {loading && <Loader2 className="w-6 h-6 animate-spin" />}
          {loading ? 'Predicting...' : 'Run Prediction'}
        </button>
      </div>
    </div>
  )
}
