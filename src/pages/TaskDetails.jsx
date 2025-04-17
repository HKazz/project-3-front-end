import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pages-css/TaskDetails.css';

function TaskDetails() {
  const { projectId, taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTaskDetails();
  }, [projectId, taskId]);

  const fetchTaskDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("You must be logged in to view task details");
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/tasks/${taskId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setTask(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching task details:', error);
      if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (error.response?.status === 404) {
        setError("Task not found");
      } else {
        setError('Failed to load task details. Please try again.');
      }
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (loading) {
    return <div className="loading">Loading task details...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button 
          onClick={() => navigate(`/project/${projectId}`)} 
          className="back-button"
        >
          Back to Project
        </button>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="error-message">
        Task not found
        <button 
          onClick={() => navigate(`/project/${projectId}`)} 
          className="back-button"
        >
          Back to Project
        </button>
      </div>
    );
  }

  return (
    <div className="task-details-container">
      <div className="task-header">
        <h1>{task.taskName}</h1>
        <div className="task-actions">
          <button 
            onClick={() => navigate(`/project/${projectId}`)} 
            className="back-button"
          >
            Back to Project
          </button>
        </div>
      </div>

      <div className="task-info">
        <div className="info-section">
          <h2>Task Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Description:</span>
              <p className="info-value description">{task.taskDescription}</p>
            </div>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className={`status-badge ${task.status?.toLowerCase()}`}>
                {task.status}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Priority:</span>
              <span className={`priority-badge ${task.priority?.toLowerCase()}`}>
                {task.priority}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Start Date:</span>
              <span className="info-value">{formatDate(task.startDate)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">End Date:</span>
              <span className="info-value">{formatDate(task.endDate)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Created At:</span>
              <span className="info-value">{formatDate(task.createdAt)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Updated:</span>
              <span className="info-value">{formatDate(task.updatedAt)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Assigned To:</span>
              <span className="info-value">
                {task.assignedUser ? task.assignedUser.username : 'Unassigned'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Created By:</span>
              <span className="info-value">
                {task.projectManager ? task.projectManager.username : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetails; 