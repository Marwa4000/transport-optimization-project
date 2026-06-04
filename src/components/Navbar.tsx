import { useLocation } from 'react-router-dom'

const titles: Record<string, string> = {
  '/': 'Prediction',
  '/assignment': 'Assignment',
  '/results': 'Results',
  '/dashboard': 'History',
  '/about': 'About',
}

export default function Navbar() {
  const location = useLocation()
  const title = titles[location.pathname] ?? 'Prediction'
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      <span className="text-sm text-gray-500">{today}</span>
    </header>
  )
}