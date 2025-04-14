import { Link } from "react-router"
import { useContext } from "react"
import { authContext } from "../context/AuthContext"


function Navbar() {
  const {user, logout} = useContext(authContext)


  return (
    <div>
      <ul>
        <Link to="/"><li>Homepage</li></Link>
        <Link to="/projects"><li>Projects</li></Link>
        <Link to="/project/create"><li>Create Project</li></Link>
        <Link to="/project/:projectId/edit"><li>Edit Project</li></Link>
        <Link to="/project/:projectId/delete"><li>Delete Project</li></Link>
        <Link to="/project/:projectId/tasks/create"><li>Create Task</li></Link>
        <Link to="/project/:projectId/tasks/:taskId/edit"><li>Edit Task</li></Link>
        <Link to="/project/:projectId/tasks/:taskId/delete"><li>Delete Task</li></Link>
        {user && (

          <>
          <li>Welcome {user.username}</li>
          <button onClick={logout}>Logout</button>
          </>
        )}
        {!user && (
          <>
          <Link to='/login'><li>Login</li></Link>
          <Link to='/signup'><li>Signup</li></Link>
          </>
        )}
        

      </ul>
    </div>
  )
}

export default Navbar
