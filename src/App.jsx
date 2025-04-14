import './App.css'
import {Routes ,Route, BrowserRouter} from 'react-router'
import Login from './pages/Login'
import LandingPage from './pages/Landing'
import Signup from './pages/Signup'
import Navbar from './components/Navbar'
import ValidateIsLoggedIn from './validators/ValidateIsLoggedIn'
import ValidateIsLoggedOut from './validators/ValidateIsLoggedOut'
import CreateProject from './pages/CreateProject'
import EditProject from './pages/EditProject'
import DeleteProject from './pages/DeleteProject'
import CreateTask from './pages/CreateTask'
import EditTask from './pages/EditTask'
import DeleteTask from './pages/DeleteTask'
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
      <Routes>
        {user ? (
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/project/create" element={<CreateProject/>}/>
            <Route path="/project/:projectId/edit" element={<EditProject/>}/>
            <Route path="/project/:projectId/delete" element={<DeleteProject/>}/>
            <Route path="/project/:projectId/tasks/create" element={<CreateTask/>}/>
            <Route path="/project/:projectId/tasks/:taskId/edit" element={<EditTask/>}/>
            <Route path="/project/:projectId/tasks/:taskId/delete" element={<DeleteTask/>}/>
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </>
        )}
      </Routes>
    </>
  );
}

export default App
