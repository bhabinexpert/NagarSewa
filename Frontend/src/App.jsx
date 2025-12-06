import { Route, Routes } from 'react-router-dom'
import './App.css'
import Signup from './pages/signup'
import Login from './pages/login'



function App() {

  return (
    <>
    <Routes>
      <Route path='/login' element ={<Login/>} />
      <Route path='/' element ={<Login/>} />
      <Route path='/signup' element = {<Signup/>} />

    </Routes>
     
    </>
  )
}

export default App
