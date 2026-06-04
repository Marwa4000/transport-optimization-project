import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import PredictionPage from './pages/PredictionPage'
import AssignmentPage from './pages/AssignmentPage'
import ResultsPage from './pages/ResultsPage'
import Dashboard from './pages/Dashboard'
import AboutModel from './pages/AboutModel'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-8">
            <Routes>
              <Route path="/" element={<PredictionPage />} />
              <Route path="/assignment" element={<AssignmentPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/about" element={<AboutModel />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
