import { Route, Routes } from 'react-router-dom'
import './App.css'
import Signup from './pages/signup'
import Login from './pages/login'
import Landing from './pages/landing'
import UserDashboard from './pages/dashboard/UserDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import { LanguageProvider } from "./context/LanguageProvider";
import { AuthProvider } from "./context/AuthContext";



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
