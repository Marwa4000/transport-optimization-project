import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Zap, BarChart2, Info, Truck } from 'lucide-react'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/', label: 'Optimization', icon: Zap, end: true },
  { to: '/results', label: 'Results', icon: BarChart2 },
  { to: '/about', label: 'About Model', icon: Info },
]

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Truck className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-800">Transport PFA</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
