import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import "../pages-css/ProjectList.css";

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getProjects();
  }, []);

  async function getProjects() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/project`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch projects. Please try again");
      setLoading(false);
      console.error(error);
    }
  }

  const handleDelete = async (project) => {
    const hasTasks = project.tasks && project.tasks.length > 0;
    const confirmMessage = hasTasks 
      ? 'This project has tasks associated with it. Deleting the project will also delete all its tasks. Are you sure you want to continue?'
      : 'Are you sure you want to delete this project?';

    if (window.confirm(confirmMessage)) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("You must be logged in to delete a project");
          return;
        }

        // First, try to delete all tasks if the project has any
        if (hasTasks) {
          try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/project/${project._id}/tasks`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (error) {
            console.error('Error deleting tasks:', error);
            // Continue with project deletion even if task deletion fails
          }
        }

        // Try the primary endpoint first
        try {
          await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/project/${project._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (error) {
          // If primary endpoint fails, try the alternative endpoint
          if (error.response?.status === 404) {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/project/${project._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } else {
            throw error;
          }
        }

        // If deletion was successful, refresh the projects list
        await getProjects();
      } catch (error) {
        console.error('Delete error:', error);
        if (error.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
          navigate('/login');
        } else if (error.response?.status === 403) {
          setError("You don't have permission to delete this project");
        } else if (error.response?.status === 404) {
          setError("Project not found");
        } else if (error.response?.status === 409) {
          setError("Cannot delete project. Please delete all tasks first.");
        } else {
          setError(`Failed to delete project: ${error.response?.data?.message || error.message}`);
        }
      }
    }
  };

  const handleViewDetails = (projectId) => {
    console.log("Viewing details for project:", projectId);
    console.log("Navigating to URL:", `/project/${projectId}`);
    navigate(`/project/${projectId}`);
  };

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button 
          onClick={() => setError('')} 
          className="retry-button"
          style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="project-list-container">
      <h1>Your Projects</h1>
      {projects.length === 0 ? (
        <p className="no-projects">No projects found. Create a new project to get started!</p>
      ) : (
        <ul className="project-list">
          {projects.map((project) => (
            <li key={project._id} className="project-item">
              <div className="project-content">
                <h3>{project.projectName}</h3>
                <p>{project.projectDescription}</p>
                <div className="project-meta">
                  <span className="project-date">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <span className="project-tasks">
                    Tasks: {project.tasks?.length || 0}
                  </span>
                </div>
                <div className="project-actions">
                  <button 
                    onClick={() => handleViewDetails(project._id)} 
                    className="view-button"
                  >
                    View Details
                  </button>
                  <Link to={`/project/${project._id}/edit`} className="edit-button">
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(project)} 
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProjectList;