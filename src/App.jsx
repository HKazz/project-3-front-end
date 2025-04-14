import './App.css'
import {Routes ,Route} from 'react-router'
import Login from './pages/Login'
// import Homepage from './pages/Homepage'
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

function App() {


  return (
    <>
      <Navbar/>
      <Routes>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/project/create" element={<CreateProject/>}/>
        <Route path="/project/:projectId/edit" element={<EditProject/>}/>
        <Route path="/project/:projectId/delete" element={<DeleteProject/>}/>
        <Route path="/project/:projectId/tasks/create" element={<CreateTask/>}/>
        <Route path="/project/:projectId/tasks/:taskId/edit" element={<EditTask/>}/>
        <Route path="/project/:projectId/tasks/:taskId/delete" element={<DeleteTask/>}/>
      </Routes>
    </>
    
  )
}

export default App
