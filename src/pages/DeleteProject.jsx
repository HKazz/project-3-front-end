// DeleteProject.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../pages-css/ProjectDetails.css";

function DeleteProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [project, setProject] = useState(null);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("You must be logged in to delete a project");
        navigate('/login');
        return;
      }

      // Try the primary endpoint first
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProject(response.data);
        setLoading(false);
      } catch (error) {
        // If primary endpoint fails, try the alternative endpoint
        if (error.response?.status === 404) {
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/project/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProject(response.data);
          setLoading(false);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError("You don't have permission to delete this project");
      } else if (error.response?.status === 404) {
        setError("Project not found");
      } else {
        setError('Failed to load project details. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("You must be logged in to delete a project");
        navigate('/login');
        return;
      }

      // First, try to delete all tasks if the project has any
      if (project.tasks && project.tasks.length > 0) {
        try {
          await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/project/${projectId}/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (error) {
          console.error('Error deleting tasks:', error);
          // Continue with project deletion even if task deletion fails
        }
      }

      // Try the primary endpoint first
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess(true);
        setTimeout(() => {
          navigate('/projects');
        }, 2000);
      } catch (error) {
        // If primary endpoint fails, try the alternative endpoint
        if (error.response?.status === 404) {
          await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/project/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSuccess(true);
          setTimeout(() => {
            navigate('/projects');
          }, 2000);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 403) {
        setError("You don't have permission to delete this project");
      } else if (error.response?.status === 404) {
        setError("Project not found");
      } else if (error.response?.status === 409) {
        setError("Cannot delete project. Please delete all tasks first.");
      } else {
        setError(`Failed to delete project: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !project) {
    return <div className="loading">Loading project details...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button 
          onClick={() => navigate('/projects')} 
          className="retry-button"
          style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
        >
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="error-message">
        Project not found
        <button 
          onClick={() => navigate('/projects')} 
          className="retry-button"
          style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="project-details-container">
      <div className="project-header">
        <h1>Delete Project: {project.projectName}</h1>
      </div>

      <div className="project-info">
        <h2>Project Details</h2>
        <p>{project.projectDescription || 'No description provided'}</p>
        <div className="project-meta">
          <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
          <span>Tasks: {project.tasks?.length || 0}</span>
        </div>
      </div>

      {success ? (
        <div className="success-message">
          Project deleted successfully! Redirecting to projects list...
        </div>
      ) : (
        <div className="delete-confirmation">
          <h2>Confirm Deletion</h2>
          <p>Are you sure you want to delete this project? This action cannot be undone.</p>
          {project.tasks && project.tasks.length > 0 && (
            <p className="warning-message">
              Warning: This project has {project.tasks.length} tasks. Deleting the project will also delete all its tasks.
            </p>
          )}
          <div className="action-buttons">
            <button 
              onClick={handleDelete} 
              className="delete-button"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Project"}
            </button>
            <button 
              onClick={() => navigate(`/project/${projectId}`)} 
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeleteProject;
