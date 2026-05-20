import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Download, PlusCircle, Users, DollarSign, Sigma, TrendingDown } from 'lucide-react'
import StatCard from '../components/StatCard'
import type { OptimizationResult } from '../services/api'

function worstCost(matrix: number[][]): number {
  return matrix.reduce((sum, row) => sum + Math.max(...row), 0)
}

export default function ResultsPage() {
  const navigate = useNavigate()
  const raw = localStorage.getItem('lastOptimization')
  const result: OptimizationResult | null = raw ? JSON.parse(raw) : null
  const model = localStorage.getItem('lastModel') ?? 'random_forest'

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Sigma className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-xl text-gray-500 font-medium">No results yet</p>
        <p className="text-gray-400 text-sm mt-1">Run an optimization first.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          Go to Optimization
        </button>
      </div>
    )
  }

  const { assignments, total_cost, cost_matrix } = result
  const sellerList: { seller_city: string; seller_state: string; price: number }[] = JSON.parse(localStorage.getItem('lastSellers') || '[]')
  const customerList: { customer_city: string; customer_state: string }[] = JSON.parse(localStorage.getItem('lastCustomers') || '[]')
  const matrixSellers = sellerList.length ? sellerList : [...new Map(assignments.map(a => [a.seller.seller_city, a.seller])).values()]
  const matrixCustomers = customerList.length ? customerList : assignments.map(a => a.customer)
  const totalSellers = matrixSellers.length
  const totalCustomers = matrixCustomers.length
  const totalPairs = totalSellers * totalCustomers
  const worst = worstCost(cost_matrix)
  const saved = worst - total_cost

  const chartData = assignments.map((a, i) => ({
    name: `#${i + 1}`,
    cost: a.predicted_freight_value,
  }))

  const exportCSV = () => {
    const header = 'Seller City,Seller State,Customer City,Customer State,Predicted Freight (MAD)\n'
    const rows = assignments.map(a =>
      `${a.seller.seller_city},${a.seller.seller_state},${a.customer.customer_city},${a.customer.customer_state},${a.predicted_freight_value.toFixed(2)}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'optimization_results.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const newOptimization = () => {
    localStorage.removeItem('lastOptimization')
    localStorage.removeItem('lastSellers')
    localStorage.removeItem('lastCustomers')
    localStorage.removeItem('lastModel')
    navigate('/')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-gray-800">Optimization Results</h2>
          <span className="ml-3 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full capitalize">
            {model.replace('_', ' ')}
          </span>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={newOptimization} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors">
            <PlusCircle className="w-4 h-4" /> New Optimization
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Sellers" value={totalSellers} icon={<Users className="w-6 h-6 text-white" />} color="bg-emerald-500" />
        <StatCard title="Total Customers" value={totalCustomers} icon={<Users className="w-6 h-6 text-white" />} color="bg-blue-500" />
        <StatCard title="Pairs Evaluated" value={totalPairs} icon={<Sigma className="w-6 h-6 text-white" />} color="bg-purple-500" />
        <StatCard title="Total Optimized Cost" value={`${total_cost.toFixed(2)} MAD`} icon={<DollarSign className="w-6 h-6 text-white" />} color="bg-indigo-500" />
        <StatCard title="Cost Saved vs Worst" value={`${saved.toFixed(2)} MAD`} icon={<TrendingDown className="w-6 h-6 text-white" />} color="bg-rose-500" />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost per Assignment</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis unit=" MAD" />
            <Tooltip />
            <Bar dataKey="cost" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* COST MATRIX */}
      {cost_matrix && cost_matrix.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Matrix — Predicted Freight per Pair (MAD)</h3>
          <table className="w-full text-xs text-center divide-y divide-x border border-gray-200">
            <thead>
              <tr className="divide-x divide-gray-200">
                <th className="px-3 py-2 bg-gray-50 text-gray-600 font-medium text-left w-32">Customer \ Seller</th>
                {matrixSellers.map((s, j) => (
                  <th key={j} className="px-3 py-2 bg-gray-50 text-gray-600 font-medium flex-1 min-w-[100px]">{s.seller_city}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {matrixCustomers.map((c, i) => (
                <tr key={i} className="divide-x divide-gray-200">
                  <td className="px-3 py-2 bg-gray-50 text-gray-600 font-medium text-left">{c.customer_city}</td>
                  {cost_matrix[i]?.map((cost, j) => {
                    const isSelected = matrixSellers[j]?.seller_city === (assignments[i]?.seller.seller_city ?? '')
                    return (
                      <td
                        key={j}
                        className={`px-3 py-2 font-medium ${
                          isSelected ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-gray-50 text-gray-400'
                        }`}
                      >
                        {cost.toFixed(1)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ASSIGNMENT TABLE */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Seller City</th>
              <th className="px-4 py-3 font-medium">Seller State</th>
              <th className="px-4 py-3 font-medium">Customer City</th>
              <th className="px-4 py-3 font-medium">Customer State</th>
              <th className="px-4 py-3 font-medium">Predicted Freight (MAD)</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assignments.map((a, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{a.seller.seller_city}</td>
                <td className="px-4 py-3">{a.seller.seller_state}</td>
                <td className="px-4 py-3">{a.customer.customer_city}</td>
                <td className="px-4 py-3">{a.customer.customer_state}</td>
                <td className="px-4 py-3 font-semibold text-emerald-600">{a.predicted_freight_value.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Optimal
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
