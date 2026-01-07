import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RouteScrollToTop } from './components/RouteScrollToTop'
import LandingPage from './pages/LandingPage'
import ReasonsPage from './pages/ReasonsPage'
import AdminPage from './pages/AdminPage'

function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-24">
        <div className="glass rounded-3xl p-8 shadow-soft">
          <div className="text-lg font-semibold text-textPrimary">Halaman tidak ditemukan</div>
          <p className="mt-2 text-sm text-textSecondary">Link yang kamu buka tidak tersedia.</p>
          <a
            className="mt-6 inline-flex rounded-2xl bg-gradient-to-b from-primary to-primary-dark px-5 py-3 text-sm font-semibold text-white shadow-soft hover:brightness-105"
            href="/"
          >
            Kembali ke Home
          </a>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/reasons" element={<ReasonsPage />} />
        {/* <Route path="/admin" element={<AdminPage />} /> */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
