import { Route, Routes } from 'react-router-dom'
import './styles/App.css'
import Signup from './pages/auth/signup'
import Login from './pages/auth/login'
import Landing from './pages/landing'
import UserDashboard from './pages/dashboard/UserDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import { LanguageProvider } from "./contexts/language/LanguageProvider";
import { AuthProvider } from "./contexts/auth/AuthContext";



function App() {

  return (
    <AuthProvider>
      <LanguageProvider>
        <Routes>
          
          <Route path='/login' element ={<Login/>} />
          <Route path='/' element ={<Landing/>} />
          <Route path='/signup' element = {<Signup/>} />
          <Route path='/user' element = {<UserDashboard/>} />
          <Route path='/admin' element = {<AdminDashboard/>} />

        </Routes>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App
