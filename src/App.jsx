import './App.css'
import {Routes ,Route} from 'react-router'
import Login from './pages/Login'
import LandingPage from './pages/Landing'
import Signup from './pages/Signup'
import Navbar from './components/Navbar'
import ValidateIsLoggedIn from './validators/ValidateIsLoggedIn'
import ValidateIsLoggedOut from './validators/ValidateIsLoggedOut'
import { authContext } from './context/AuthContext'
import { useContext } from 'react'

function App() {
  const {user} = useContext(authContext);

  return (
    <>
      <div>
        {user ? <LandingPage /> : <Login />}
      </div>
    </>
  )
}

export default App
