import { Route, Routes } from 'react-router-dom'
import './App.css'
import Signup from './pages/signup'
import Login from './pages/login'
import Landing from './pages/landing'
import { LanguageProvider } from "./context/LanguageProvider";



function App() {

  return (
    <LanguageProvider>
      <Routes>
        
        <Route path='/login' element ={<Login/>} />
        <Route path='/' element ={<Landing/>} />
        <Route path='/signup' element = {<Signup/>} />

      </Routes>
    </LanguageProvider>
  )
}

export default App
