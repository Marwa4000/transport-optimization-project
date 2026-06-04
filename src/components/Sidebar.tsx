import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, GitMerge, BarChart2, Info } from 'lucide-react'

const links = [
  { to: '/', label: 'Prediction', icon: TrendingUp, end: true },
  { to: '/assignment', label: 'Assignment', icon: GitMerge },
  { to: '/results', label: 'Results', icon: BarChart2 },
  { to: '/dashboard', label: 'History', icon: LayoutDashboard },
  { to: '/about', label: 'About', icon: Info },
]

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-primary-900 border-r border-primary-700 flex flex-col">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-primary-700">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white">Transport PFA</span>
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
                  ? 'bg-primary-800 text-white'
                  : 'text-primary-200 hover:bg-primary-800 hover:text-white'
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