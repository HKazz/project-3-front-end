import './App.css'
import {Routes ,Route, BrowserRouter} from 'react-router'
import Login from './pages/Login'
import LandingPage from './pages/Landing'
import Signup from './pages/Signup'
import Navbar from './components/Navbar'
import ValidateIsLoggedIn from './validators/ValidateIsLoggedIn'
import ValidateIsLoggedOut from './validators/ValidateIsLoggedOut'
import { authContext } from './context/AuthContext'
import { useContext, useEffect } from 'react'
import ProjectList from './pages/ProjectList'
import { useNavigate } from 'react-router'

function App() {
  const { user } = useContext(authContext);

  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!user) {
  //     navigate('/signup');
  //   }
  // }, [user, navigate]);

  return (
    <>
      <Navbar/>
      <div>
        <Routes>
          {
            user ?(
              <>
                <Route path="/" element={<LandingPage />} />
                <Route path="/projects" element={<ProjectList />} />


              </>
            )
            :
            (
              <>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              </>
            )
          }
          
        </Routes>
      </div>
    </>
  );
}

export default App
