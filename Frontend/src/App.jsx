import { Route, Routes } from 'react-router-dom'
import './styles/App.css'
import Signup from './pages/auth/signup'
import Login from './pages/auth/login'
import Landing from './pages/landing'
import UserDashboard from './pages/dashboard/UserDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import { LanguageProvider } from "./contexts/language/LanguageProvider";
import { AuthProvider } from "./contexts/auth/AuthContext";
import ProtectedRoute from './components/common/ProtectedRoute';



function App() {

  return (
    <AuthProvider>
      <LanguageProvider>
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
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App
