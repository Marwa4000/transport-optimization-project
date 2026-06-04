import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Activity, DollarSign, Layers, TrendingDown } from 'lucide-react'
import StatCard from '../components/StatCard'

interface OptimizationRecord {
  date: string
  sellers: number
  customers: number
  total_cost: number
  average_cost: number
  model?: string
}

export default function Dashboard() {
  const raw = localStorage.getItem('optimizations')
  const records: OptimizationRecord[] = raw ? JSON.parse(raw) : []

  const totalRuns = records.length
  const bestCost = records.length ? Math.min(...records.map(r => r.total_cost)) : 0
  const avgCost = records.length ? records.reduce((s, r) => s + r.total_cost, 0) / records.length : 0
  const avgAssignments = records.length
    ? Math.round(records.reduce((s, r) => s + r.customers, 0) / records.length)
    : 0

  const chartData = records.map((r, i) => ({
    name: `Run #${i + 1}`,
    cost: r.total_cost,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">History</h2>
        <p className="text-gray-500">Overview of all optimizations.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Optimizations" value={totalRuns} icon={<Activity className="w-6 h-6 text-white" />} color="bg-primary-500" />
        <StatCard title="Best cost" value={`${bestCost.toFixed(2)} MAD`} icon={<DollarSign className="w-6 h-6 text-white" />} color="bg-emerald-500" />
        <StatCard title="Avg. assignments" value={avgAssignments} icon={<Layers className="w-6 h-6 text-white" />} color="bg-amber-500" />
        <StatCard title="Avg. cost (MAD)" value={avgCost.toFixed(2)} icon={<TrendingDown className="w-6 h-6 text-white" />} color="bg-rose-500" />
      </div>

      {chartData.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Total cost per optimization</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis unit=" MAD" />
                <Tooltip />
                <Bar dataKey="cost" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-800 px-6 pt-6 pb-2">Recent optimizations</h3>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Model</th>
                  <th className="px-6 py-3 font-medium">Sellers</th>
                  <th className="px-6 py-3 font-medium">Customers</th>
                  <th className="px-6 py-3 font-medium">Total cost (MAD)</th>
                  <th className="px-6 py-3 font-medium">Avg. cost (MAD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...records].reverse().map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3">{new Date(r.date).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-3 capitalize">{r.model?.replace('_', ' ') ?? '-'}</td>
                    <td className="px-6 py-3">{r.sellers}</td>
                    <td className="px-6 py-3">{r.customers}</td>
                    <td className="px-6 py-3 font-semibold text-primary-600">{r.total_cost.toFixed(2)}</td>
                    <td className="px-6 py-3">{r.average_cost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {totalRuns === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No optimizations yet.</p>
          <p className="text-gray-400 text-sm">Go to Prediction to start.</p>
        </div>
      )}
    </div>
  )
}