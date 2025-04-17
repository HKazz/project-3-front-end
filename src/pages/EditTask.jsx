import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../pages-css/CreateTask.css";

function EditTask() {
  const navigate = useNavigate();
  const { projectId, taskId } = useParams();
  
  // State variables
  const [formData, setFormData] = useState({
    taskName: "",
    taskDescription: "",
    startDate: "",
    startTime: "00:00",
    endDate: "",
    endTime: "23:59",
    priority: "medium",
    status: "Not Started"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");

  // Check backend and fetch task details
  useEffect(() => {
    const checkBackendAndFetchTask = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in again.");
          setBackendStatus("unavailable");
          return;
        }

        // Check backend health
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        try {
          await axios.get(`${backendUrl}/health`);
          setBackendStatus("available");
        } catch (healthError) {
          // Try alternative health endpoint
          try {
            await axios.get(`${backendUrl}/api/health`);
            setBackendStatus("available");
          } catch (altHealthError) {
            setBackendStatus("unavailable");
            setError("Backend server is not available. Please check if the server is running.");
            return;
          }
        }

        // Fetch task details
        await fetchTaskDetails(token, backendUrl);
      } catch (error) {
        console.error("Error in initialization:", error);
        setBackendStatus("unavailable");
        setError("Failed to initialize. Please try again later.");
      }
    };

    checkBackendAndFetchTask();
  }, [projectId, taskId]);

  // Fetch task details from backend
  const fetchTaskDetails = async (token, backendUrl) => {
    try {
      setLoading(true);
      const taskResponse = await axios.get(
        `${backendUrl}/api/tasks/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const task = taskResponse.data;
      
      // Split datetime into date and time
      const startDateTime = new Date(task.startDate);
      const endDateTime = new Date(task.endDate);
      
      setFormData({
        taskName: task.taskName,
        taskDescription: task.taskDescription,
        startDate: startDateTime.toISOString().split('T')[0],
        startTime: startDateTime.toTimeString().slice(0, 5),
        endDate: endDateTime.toISOString().split('T')[0],
        endTime: endDateTime.toTimeString().slice(0, 5),
        priority: task.priority,
        status: task.status
      });
    } catch (error) {
      console.error("Error fetching task details:", error);
      if (error.response?.status === 404) {
        setError("Task not found. Please check if the task exists.");
      } else if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError("You don't have permission to edit this task.");
      } else {
        setError("Failed to load task details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("No authentication token found. Please log in again.");
        navigate('/login');
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      // Combine date and time
      const startDateTime = `${formData.startDate}T${formData.startTime}`;
      const endDateTime = `${formData.endDate}T${formData.endTime}`;
      
      // Prepare data for submission
      const submitData = {
        taskName: formData.taskName,
        taskDescription: formData.taskDescription,
        startDate: startDateTime,
        endDate: endDateTime,
        priority: formData.priority,
        status: formData.status
      };
      
      // Update task using the correct endpoint
      await axios.put(
        `${backendUrl}/api/tasks/${taskId}`,
        submitData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Navigate back to project details
      navigate(`/project/${projectId}`);
    } catch (error) {
      console.error("Error updating task:", error);
      if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError("You don't have permission to edit this task.");
      } else if (error.response?.status === 404) {
        setError("Task not found. Please check if the task exists.");
      } else {
        setError("Failed to update task. Please try again.");
      }
    } finally {
      setSaving(false);
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
          className="retry-button"
        >
          Back to Project
        </button>
      </div>
    );
  }

  return (
    <div className="create-task-container">
      <h1>Edit Task</h1>
      <form onSubmit={handleSubmit} className="create-task-form">
        <div className="form-group">
          <label htmlFor="taskName">Task Name:</label>
          <input
            id="taskName"
            name="taskName"
            type="text"
            value={formData.taskName}
            onChange={handleChange}
            placeholder="Enter task name"
            required
            disabled={loading || backendStatus === "unavailable"}
          />
        </div>

        <div className="form-group">
          <label htmlFor="taskDescription">Task Description:</label>
          <textarea
            id="taskDescription"
            name="taskDescription"
            value={formData.taskDescription}
            onChange={handleChange}
            placeholder="Enter task description"
            disabled={loading || backendStatus === "unavailable"}
          />
        </div>

        <div className="form-group">
          <label htmlFor="startDate">Start Date and Time:</label>
          <div className="date-time-inputs">
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
              disabled={loading || backendStatus === "unavailable"}
            />
            <input
              id="startTime"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
              required
              disabled={loading || backendStatus === "unavailable"}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="endDate">End Date and Time:</label>
          <div className="date-time-inputs">
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
              disabled={loading || backendStatus === "unavailable"}
            />
            <input
              id="endTime"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
              required
              disabled={loading || backendStatus === "unavailable"}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority:</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            disabled={loading || backendStatus === "unavailable"}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={loading || backendStatus === "unavailable"}
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(`/project/${projectId}`)}
            className="cancel-button"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-button"
            disabled={loading || saving || backendStatus === "unavailable"}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditTask; 