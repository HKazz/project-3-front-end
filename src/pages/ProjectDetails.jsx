import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pages-css/ProjectDetails.css';

function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showTaskDeleteConfirm, setShowTaskDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  // Add debug logs
  console.log("ProjectDetails component rendered with projectId:", projectId);
  console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);

  useEffect(() => {
    console.log("useEffect triggered, fetching project details for ID:", projectId);
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    console.log("fetchProjectDetails called for projectId:", projectId);
    try {
      const token = localStorage.getItem('token');
      console.log("Token available:", !!token);
      
      if (!token) {
        console.log("No token found, redirecting to login");
        setError("You must be logged in to view project details");
        navigate('/login');
        return;
      }

      // Try the primary endpoint first
      const primaryUrl = `${import.meta.env.VITE_BACKEND_URL}/project/${projectId}`;
      console.log("Trying primary endpoint:", primaryUrl);
      
      try {
        const response = await axios.get(primaryUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Primary endpoint response:", response.data);
        
        // Log the tasks to see their structure
        if (response.data.tasks && response.data.tasks.length > 0) {
          console.log("First task structure:", response.data.tasks[0]);
        }
        
        setProject(response.data);
        setLoading(false);
      } catch (error) {
        console.log("Primary endpoint error:", error.message);
        // If primary endpoint fails, try the alternative endpoint
        if (error.response?.status === 404) {
          const altUrl = `${import.meta.env.VITE_BACKEND_URL}/api/project/${projectId}`;
          console.log("Trying alternative endpoint:", altUrl);
          
          const response = await axios.get(altUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Alternative endpoint response:", response.data);
          
          // Log the tasks to see their structure
          if (response.data.tasks && response.data.tasks.length > 0) {
            console.log("First task structure:", response.data.tasks[0]);
          }
          
          setProject(response.data);
          setLoading(false);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      if (error.response) {
        console.log("Error response status:", error.response.status);
        console.log("Error response data:", error.response.data);
      }
      
      if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError("You don't have permission to view this project");
      } else if (error.response?.status === 404) {
        setError("Project not found");
      } else {
        setError('Failed to load project details. Please try again.');
      }
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'completed';
      case 'in progress':
        return 'in-progress';
      case 'pending':
        return 'pending';
      default:
        return 'pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // Format the date with more detail for Last Updated
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      };
      
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Add a function to refresh project details
  const refreshProjectDetails = () => {
    fetchProjectDetails();
  };

  // Replace the navigation listener with a location-based effect
  useEffect(() => {
    // Refresh project details when component mounts or when location changes
    refreshProjectDetails();
  }, [projectId]);

  const handleDeleteProject = async () => {
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("You must be logged in to delete a project");
        navigate('/login');
        return;
      }

      const API_URL = import.meta.env.VITE_BACKEND_URL;
      console.log("Attempting to delete project with ID:", projectId);
      console.log("Using API URL:", `${API_URL}/project/${projectId}`);

      // Try the primary endpoint first
      try {
        await axios.delete(`${API_URL}/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Project deleted successfully using primary endpoint");
      } catch (error) {
        console.log("Primary endpoint delete failed:", error.message);
        // If primary endpoint fails, try the alternative endpoint
        if (error.response?.status === 404) {
          console.log("Trying alternative endpoint for delete");
          await axios.delete(`${API_URL}/api/project/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log("Project deleted successfully using alternative endpoint");
        } else {
          throw error;
        }
      }

      // Show success message briefly before redirecting
      setError("Project deleted successfully");
      setTimeout(() => {
        navigate('/projects');
      }, 1500);
    } catch (error) {
      console.error('Error deleting project:', error);
      if (error.response) {
        console.log("Delete error response status:", error.response.status);
        console.log("Delete error response data:", error.response.data);
      }
      
      if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError("You don't have permission to delete this project");
      } else if (error.response?.status === 404) {
        setError("Project not found");
      } else {
        setError('Failed to delete project. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("You must be logged in to delete a task");
        navigate('/login');
        return;
      }

      const API_URL = import.meta.env.VITE_BACKEND_URL;
      console.log("Attempting to delete task with ID:", taskId);

      // Use the correct endpoint for task deletion based on how routes are registered in the backend
      await axios.delete(`${API_URL}/tasks/${projectId}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Task deleted successfully");

      // Refresh project details to update the task list
      await fetchProjectDetails();
    } catch (error) {
      console.error('Error deleting task:', error);
      if (error.response) {
        console.log("Delete error response status:", error.response.status);
        console.log("Delete error response data:", error.response.data);
      }
      
      if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError("You don't have permission to delete this task");
      } else if (error.response?.status === 404) {
        setError("Task not found");
      } else {
        setError('Failed to delete task. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
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
        <h1>{project.projectName}</h1>
        <div className="project-actions">
          <Link to={`/project/${projectId}/edit`} className="edit-button">
            Edit Project
          </Link>
          <Link to={`/project/${projectId}/tasks/create`} className="create-task-button">
            Create New Task
          </Link>
          <button 
            onClick={() => setShowDeleteConfirm(true)} 
            className="delete-button"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirmation-modal">
          <div className="delete-confirmation-content">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this project? This action cannot be undone.</p>
            <div className="delete-confirmation-buttons">
              <button 
                onClick={handleDeleteProject} 
                className="confirm-delete-button"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="cancel-delete-button"
                disabled={deleteLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="project-info">
        <h2>Project Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Description:</span>
            <p className="info-value">{project.projectDescription || 'No description provided'}</p>
          </div>
          <div className="info-item">
            <span className="info-label">Start Date:</span>
            <span className="info-value">{formatDate(project.startDate)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">End Date:</span>
            <span className="info-value">{formatDate(project.endDate)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Created At:</span>
            <span className="info-value">{formatDate(project.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="tasks-section">
        <h2>Tasks</h2>
        {project.tasks && project.tasks.length > 0 ? (
          <div className="tasks-grid">
            {project.tasks.map((task) => (
              <div key={task._id} className="task-card">
                <div className="task-header">
                  <h3>{task.taskName}</h3>
                  <div className="task-actions">
                    <span className={`status-badge ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <button
                      className="task-delete-button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteTask(task._id);
                      }}
                      disabled={deleteLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="task-description">{task.taskDescription}</p>
                <div className="task-info">
                  <div className="info-item">
                    <span className="info-label">Start Date:</span>
                    <span className="info-value">{formatDate(task.startDate)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">End Date:</span>
                    <span className="info-value">{formatDate(task.endDate)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Priority:</span>
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-tasks">No tasks found for this project.</p>
        )}
      </div>
    </div>
  );
}

export default ProjectDetails; 