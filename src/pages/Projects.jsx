import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { authContext } from "../context/AuthContext"
import axios from "axios"
import "../pages-css/Projects.css"

function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useContext(authContext)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("No authentication token found")
          setLoading(false)
          return
        }

        const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
        console.log("Fetching projects from:", `${API_URL}/api/user/projects`)
        
        const response = await axios.get(`${API_URL}/api/user/projects`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        console.log("Projects response:", response.data)

        // Ensure response.data is an array
        if (Array.isArray(response.data)) {
          setProjects(response.data)
        } else if (response.data && typeof response.data === 'object') {
          // If it's an object, try to find the array property
          const projectsArray = Object.values(response.data).find(value => Array.isArray(value))
          if (projectsArray) {
            setProjects(projectsArray)
          } else {
            setProjects([])
          }
        } else {
          setProjects([])
        }
        
        setLoading(false)
      } catch (err) {
        console.error("Error fetching projects:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        })
        
        let errorMessage = "Failed to fetch projects"
        
        if (err.response?.status === 401) {
          errorMessage = "Your session has expired. Please log in again."
        } else if (err.response?.status === 404) {
          errorMessage = "Projects service not available"
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error
        } else if (err.response?.data?.err) {
          errorMessage = err.response.data.err
        }
        
        setError(errorMessage)
        setLoading(false)
      }
    }

    fetchProjects()
  }, []) // Remove user.token dependency since we're using localStorage

  if (loading) {
    return (
      <div className="projects-container">
        <div className="loading-spinner">Loading projects...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="projects-container">
        <div className="error-message">{error}</div>
        {error.includes("session has expired") && (
          <Link to="/login" className="login-link">Log in again</Link>
        )}
      </div>
    )
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1 className="projects-title">My Projects</h1>
        <Link to="/project/create" className="create-project-button">
          Create New Project
        </Link>
      </div>

      {!Array.isArray(projects) || projects.length === 0 ? (
        <div className="no-projects">
          <p>You don't have any projects yet.</p>
          <Link to="/project/create" className="create-project-link">
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project._id} className="project-card">
              <Link
                to={`/project/${project._id}`}
                className="project-link"
              >
                <h2 className="project-title">{project.title || project.projectName}</h2>
                <p className="project-description">{project.description || project.projectDescription}</p>
                <div className="project-meta">
                  <span className="project-date">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <span className="project-tasks">
                    Tasks: {project.tasks?.length || 0}
                  </span>
                </div>
              </Link>
              <div className="project-actions">
                <Link
                  to={`/project/${project._id}`}
                  className="view-button"
                >
                  View Details
                </Link>
                {project.projectManager?._id === localStorage.getItem('userId') && (
                  <Link
                    to={`/project/${project._id}?showMembers=true`}
                    className="manage-members-button"
                  >
                    Manage Members
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Projects 