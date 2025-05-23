import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Projects from './pages/Projects'
import Navbar from './components/Navbar'
import { useContext } from 'react'
import { authContext } from './context/AuthContext'
import CreateProject from './pages/CreateProject'
import ProjectDetails from './pages/ProjectDetails'
import EditProject from './pages/EditProject'
import CreateTask from './pages/CreateTask'
import EditTask from './pages/EditTask'
import ProtectedRoute from './components/ProtectedRoute'
import AddMember from './pages/AddMember'
import TeamWorkDetails from './pages/TeamWorkDetails'
import TeamMembers from './pages/TeamMembers'

function App() {
  const { user } = useContext(authContext)

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/projects" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/projects" />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/create" element={<CreateProject />} />
            <Route path="/project/:projectId" element={<ProjectDetails />} />
            <Route path="/project/:projectId/edit" element={<EditProject />} />
            <Route path="/project/:projectId/tasks/create" element={<CreateTask />} />
            <Route path="/project/:projectId/tasks/:taskId/edit" element={<EditTask />} />
            <Route path="/project/:projectId/add-member" element={<AddMember />} />
            <Route path="/project/:projectId/team" element={<TeamWorkDetails />} />
          </Route>

          <Route path="/team-members" element={<TeamMembers />} />

          <Route path="/" element={<Navigate to="/projects" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
