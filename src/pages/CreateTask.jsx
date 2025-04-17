// CreateTask.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../pages-css/CreateTask.css";

function CreateTask() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  // State variables
  const [formData, setFormData] = useState({
    taskName: "",
    taskDescription: "",
    startDate: "",
    endDate: "",
    priority: "medium",
    status: "pending"
  });
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");

  // Check backend and fetch projects
  useEffect(() => {
    const checkBackendAndFetchProjects = async () => {
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

        // If projectId is not valid, fetch projects
        if (!projectId || projectId === ":projectId") {
          await fetchProjects(token, backendUrl);
        } else {
          // Check if project exists
          await checkProjectExists(projectId, token, backendUrl);
        }
      } catch (error) {
        console.error("Error in initialization:", error);
        setBackendStatus("unavailable");
        setError("Failed to initialize. Please try again later.");
      }
    };

    checkBackendAndFetchProjects();
  }, [projectId]);

  // Fetch projects from backend
  const fetchProjects = async (token, backendUrl) => {
    try {
      // Try different endpoints for fetching projects
      let projectsResponse;
      
      try {
        // Try primary endpoint
        projectsResponse = await axios.get(
          `${backendUrl}/projects`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (primaryError) {
        // Try alternative endpoint
        try {
          projectsResponse = await axios.get(
            `${backendUrl}/api/projects`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (altError) {
          // Try another alternative endpoint
          projectsResponse = await axios.get(
            `${backendUrl}/api/user/projects`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      if (projectsResponse && projectsResponse.data) {
        setProjects(projectsResponse.data);
        
        // If we have projects and no project is selected, select the first one
        if (projectsResponse.data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(projectsResponse.data[0]._id);
        } else if (projectsResponse.data.length === 0) {
          setError("No projects found. Please create a project first.");
        }
      } else {
        setError("No projects found. Please create a project first.");
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError("Authentication failed. Please log in again.");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setError(`Failed to fetch projects: ${error.response.data.message || error.response.data.error || 'Unknown error'}`);
        }
      } else if (error.request) {
        setError("Failed to fetch projects. Please check if the backend server is running.");
      } else {
        setError("Failed to fetch projects. Please try again later.");
      }
    }
  };

  // Check if project exists
  const checkProjectExists = async (projectId, token, backendUrl) => {
    try {
      const projectResponse = await axios.get(
        `${backendUrl}/project/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSelectedProjectId(projectId);
    } catch (error) {
      console.error("Project check failed:", error);
      
      if (error.response && error.response.status === 500) {
        setError("Invalid project ID. Please select a valid project.");
        // Fetch projects to allow selection
        await fetchProjects(token, backendUrl);
      } else {
        setError("Project not found or you don't have access to it.");
      }
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

  // Handle project selection
  const handleProjectChange = (e) => {
    setSelectedProjectId(e.target.value);
  };

  // Validate form data
  const validateForm = () => {
    if (!selectedProjectId || selectedProjectId === ":projectId") {
      setError("Please select a valid project");
      return false;
    }
    if (!formData.taskName.trim()) {
      setError("Task name is required");
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      setError("Start date and end date are required");
      return false;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError("End date must be after start date");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess(false);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    // Get the token
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      let response;
      
      // Try primary endpoint
      try {
        response = await axios.post(
          `${backendUrl}/project/${selectedProjectId}/tasks`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );
      } catch (firstError) {
        // Try alternative endpoint
        try {
          response = await axios.post(
            `${backendUrl}/api/project/${selectedProjectId}/tasks`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            }
          );
        } catch (altError) {
          // Try another alternative endpoint
          response = await axios.post(
            `${backendUrl}/api/tasks`,
            {
              ...formData,
              projectId: selectedProjectId
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            }
          );
        }
      }

      setSuccess(true);
      
      // Clear form
      setFormData({
        taskName: "",
        taskDescription: "",
        startDate: "",
        endDate: "",
        priority: "medium",
        status: "pending"
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/project/${selectedProjectId}`);
      }, 2000);

    } catch (error) {
      console.error("Error creating task:", error);
      
      if (error.response) {
        if (error.response.status === 404) {
          setError("Project not found. Please check if the project exists.");
        } else if (error.response.status === 401) {
          setError("Authentication failed. Please log in again.");
          setTimeout(() => navigate("/login"), 2000);
        } else if (error.response.status === 400) {
          setError(`Validation error: ${error.response.data.message || error.response.data.error || 'Invalid data provided'}`);
        } else if (error.response.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(`Server error: ${error.response.status} - ${error.response.data.message || error.response.data.error || 'Unknown error'}`);
        }
      } else if (error.request) {
        setError("No response from server. Please check if the backend server is running.");
      } else {
        setError(`Request error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-task-container">
      <h2>Create New Task</h2>
      
      {backendStatus === "checking" && (
        <div className="info-message">
          Checking backend connection...
        </div>
      )}
      
      {backendStatus === "unavailable" && (
        <div className="error-message">
          Backend server is not available. Please check if the server is running.
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          Task created successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-task-form">
        {(!projectId || projectId === ":projectId" || projects.length > 0) && (
          <div className="form-group">
            <label htmlFor="projectId">Select Project:</label>
            <select
              id="projectId"
              name="projectId"
              value={selectedProjectId}
              onChange={handleProjectChange}
              required
              disabled={loading || backendStatus === "unavailable"}
            >
              <option value="">-- Select a Project --</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.projectName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="taskName">Task Name:</label>
          <input
            id="taskName"
            name="taskName"
            type="text"
            value={formData.taskName}
            onChange={handleChange}
            required
            placeholder="Enter task name"
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
          <label htmlFor="startDate">Start Date:</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
            disabled={loading || backendStatus === "unavailable"}
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">End Date:</label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            required
            disabled={loading || backendStatus === "unavailable"}
          />
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
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading || backendStatus === "unavailable"}
          className="submit-button"
        >
          {loading ? "Creating..." : "Create Task"}
        </button>
      </form>
    </div>
  );
}

export default CreateTask;