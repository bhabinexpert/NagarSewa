import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import { LanguageProvider } from "./contexts/language/LanguageProvider";
import { AuthProvider } from "./contexts/auth/AuthContext";
import ProtectedRoute from './components/common/ProtectedRoute';

// Lazy-load route pages so each is fetched only when visited.
// This keeps the initial bundle small and speeds up first load.
const Landing = lazy(() => import('./pages/landing'))
const Login = lazy(() => import('./pages/auth/login'))
const Signup = lazy(() => import('./pages/auth/signup'))
const UserDashboard = lazy(() => import('./pages/dashboard/UserDashboard'))
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-emerald-950">
      <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  )
}

function App() {

  return (
    <AuthProvider>
      <LanguageProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>

            <Route path='/login' element ={<Login/>} />
            <Route path='/' element ={<Landing/>} />
            <Route path='/signup' element = {<Signup/>} />
            <Route
              path='/user'
              element={
                <ProtectedRoute requiredRole="user">
                  <UserDashboard/>
                </ProtectedRoute>
              }
            />
            <Route
              path='/admin'
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard/>
                </ProtectedRoute>
              }
            />

          </Routes>
        </Suspense>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App
