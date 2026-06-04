import { GitBranch, Sigma } from 'lucide-react'

const features = [
  'seller_city',
  'seller_state',
  'customer_city',
  'customer_state',
  'price',
  'freight_value',
  'delivery_time',
  'distance',
  'same_city',
]

const modelRows = [
  { name: 'Linear Regression', r2: '—', mae: '—', rmse: '—', bestFor: 'Baseline / interpretability' },
  { name: 'Random Forest', r2: '—', mae: '—', rmse: '—', bestFor: 'Best overall accuracy' },
  { name: 'XGBoost', r2: '—', mae: '—', rmse: '—', bestFor: 'Gradient boosting' },
  { name: 'SVR', r2: '—', mae: '—', rmse: '—', bestFor: 'Non-linear patterns' },
]

export default function AboutModel() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">About the Model</h2>
        <p className="text-gray-500">Machine learning model used for predictions.</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Model Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">R²</th>
                <th className="px-4 py-3 font-medium">MAE</th>
                <th className="px-4 py-3 font-medium">RMSE</th>
                <th className="px-4 py-3 font-medium">Best for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {modelRows.map((m, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{m.name}</td>
                  <td className="px-4 py-3">{m.r2}</td>
                  <td className="px-4 py-3">{m.mae}</td>
                  <td className="px-4 py-3">{m.rmse}</td>
                  <td className="px-4 py-3 text-gray-600">{m.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-3">Metrics will be updated after training.</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-800">Features</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {features.map((f) => (
            <span key={f} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg">
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sigma className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-800">Assignment Algorithm: Hungarian Method</h3>
        </div>
        <p className="text-gray-600 leading-relaxed mb-3">
          Customer-to-seller assignment uses the <strong>Hungarian Algorithm</strong> (also called
          the Kuhn–Munkres algorithm), a combinatorial optimization method that solves the assignment
          problem in polynomial time (<em>O(n³)</em>).
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          Given <em>n</em> sellers and <em>m</em> customers, the algorithm builds a cost matrix
          where each entry represents the predicted transport cost of assigning a customer to a
          seller. It then finds the minimum-cost assignment.
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
          <li>Step 1: Subtract the minimum cost from each row.</li>
          <li>Step 2: Subtract the minimum cost from each column.</li>
          <li>Step 3: Cover all zeros with a minimum number of lines.</li>
          <li>Step 4: If the number of lines = <em>n</em>, an optimal assignment is found.</li>
          <li>Step 5: Otherwise, adjust the matrix and repeat.</li>
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">About the Project</h3>
        <p className="text-gray-600 leading-relaxed">
          This project is part of a <strong>Final Year Project (PFA)</strong> focused on transport logistics
          optimization through machine learning. The XGBoost Regressor model predicts freight costs
          based on shipment characteristics.
        </p>
        <p className="text-gray-600 leading-relaxed">
          By providing accurate cost estimates, this tool helps businesses and logistics providers
          make informed decisions, reduce operational expenses, and improve route planning.
        </p>
      </div>
    </div>
  )
}