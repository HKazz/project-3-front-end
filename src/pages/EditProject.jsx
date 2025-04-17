// EditProject.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages-css/EditProject.css";

function EditProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState({
    projectName: "",
    projectDescription: "",
    startDate: "",
    startTime: "00:00",
    endDate: "",
    endTime: "23:59"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("You must be logged in to edit a project");
        navigate('/login');
        return;
      }

      const API_URL = import.meta.env.VITE_BACKEND_URL;
      console.log("Fetching project with ID:", projectId);
      
      // Try the primary endpoint first
      try {
        const response = await axios.get(`${API_URL}/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Project fetched successfully:", response.data);
        
        // Split the datetime into date and time
        const startDateTime = new Date(response.data.startDate);
        const endDateTime = new Date(response.data.endDate);
        
        setProject({
          ...response.data,
          startDate: startDateTime.toISOString().split('T')[0],
          startTime: startDateTime.toTimeString().slice(0, 5),
          endDate: endDateTime.toISOString().split('T')[0],
          endTime: endDateTime.toTimeString().slice(0, 5)
        });
      } catch (error) {
        console.log("Primary endpoint error:", error.message);
        // If primary endpoint fails, try the alternative endpoint
        if (error.response?.status === 404) {
          const response = await axios.get(`${API_URL}/api/project/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Project fetched successfully from alternative endpoint:", response.data);
          
          // Split the datetime into date and time
          const startDateTime = new Date(response.data.startDate);
          const endDateTime = new Date(response.data.endDate);
          
          setProject({
            ...response.data,
            startDate: startDateTime.toISOString().split('T')[0],
            startTime: startDateTime.toTimeString().slice(0, 5),
            endDate: endDateTime.toISOString().split('T')[0],
            endTime: endDateTime.toTimeString().slice(0, 5)
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError("You don't have permission to edit this project");
      } else if (error.response?.status === 404) {
        setError("Project not found");
      } else {
        setError("Failed to load project. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("You must be logged in to edit a project");
        navigate('/login');
        return;
      }

      const API_URL = import.meta.env.VITE_BACKEND_URL;
      console.log("Updating project with ID:", projectId);
      
      // Combine date and time
      const startDateTime = `${project.startDate}T${project.startTime}`;
      const endDateTime = `${project.endDate}T${project.endTime}`;
      
      // Add current timestamp for updatedAt field
      const updatedProject = {
        ...project,
        startDate: startDateTime,
        endDate: endDateTime,
        updatedAt: new Date().toISOString()
      };
      
      // Remove the separate time fields before sending
      delete updatedProject.startTime;
      delete updatedProject.endTime;
      
      // Try the primary endpoint first
      try {
        await axios.put(`${API_URL}/project/${projectId}`, updatedProject, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Project updated successfully");
      } catch (error) {
        console.log("Primary endpoint error:", error.message);
        // If primary endpoint fails, try the alternative endpoint
        if (error.response?.status === 404) {
          await axios.put(`${API_URL}/api/project/${projectId}`, updatedProject, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Project updated successfully using alternative endpoint");
        } else {
          throw error;
        }
      }

      // Show success message briefly before redirecting
      setError("Project updated successfully");
      setTimeout(() => {
        navigate(`/project/${projectId}`);
      }, 1500);
    } catch (error) {
      console.error("Error updating project:", error);
      if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError("You don't have permission to edit this project");
      } else if (error.response?.status === 404) {
        setError("Project not found");
      } else {
        setError("Failed to update project. Please try again.");
      }
    } finally {
      setSaving(false);
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
          onClick={() => navigate(`/project/${projectId}`)} 
          className="retry-button"
        >
          Back to Project
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
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="edit-project-container">
      <h1>Edit Project</h1>
      <form onSubmit={handleSubmit} className="edit-project-form">
        <div className="form-group">
          <label htmlFor="projectName">Project Name</label>
          <input
            id="projectName"
            type="text"
            value={project.projectName || ""}
            onChange={(e) => setProject({ ...project, projectName: e.target.value })}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="projectDescription">Project Description</label>
          <textarea
            id="projectDescription"
            value={project.projectDescription || ""}
            onChange={(e) => setProject({ ...project, projectDescription: e.target.value })}
            required
            className="form-textarea"
            rows="5"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="startDate">Start Date and Time</label>
          <div className="date-time-inputs">
            <input
              id="startDate"
              type="date"
              value={project.startDate || ""}
              onChange={(e) => setProject({ ...project, startDate: e.target.value })}
              className="form-input"
              required
            />
            <input
              id="startTime"
              type="time"
              value={project.startTime || "00:00"}
              onChange={(e) => setProject({ ...project, startTime: e.target.value })}
              className="form-input"
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="endDate">End Date and Time</label>
          <div className="date-time-inputs">
            <input
              id="endDate"
              type="date"
              value={project.endDate || ""}
              onChange={(e) => setProject({ ...project, endDate: e.target.value })}
              className="form-input"
              required
            />
            <input
              id="endTime"
              type="time"
              value={project.endTime || "23:59"}
              onChange={(e) => setProject({ ...project, endTime: e.target.value })}
              className="form-input"
              required
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate(`/project/${projectId}`)}
            className="cancel-button"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="save-button"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProject;
