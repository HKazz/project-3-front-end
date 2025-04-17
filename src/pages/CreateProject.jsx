// CreateProject.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../pages-css/CreateProject.css";

function CreateProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    projectName: "",
    projectDescription: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess(false);

    // Get the token
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      // Log the request details for debugging
      console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);
      console.log("Request data:", formData);
      console.log("Token:", token);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/project`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Response:", response.data);
      setSuccess(true);
      
      // Clear form
      setFormData({
        projectName: "",
        projectDescription: "",
        startDate: "",
        endDate: "",
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/projects");
      }, 2000);

    } catch (error) {
      console.error("Full error object:", error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        setError(`Server error: ${error.response.status} - ${error.response.data.message || error.response.data.error || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        setError("No response from server. Please check if the backend server is running.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", error.message);
        setError(`Request error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-project-container">
      <h2>Create New Project</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          Project created successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-project-form">
        <div className="form-group">
          <label htmlFor="projectName">Project Name:</label>
          <input
            id="projectName"
            name="projectName"
            type="text"
            value={formData.projectName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="projectDescription">Project Description:</label>
          <textarea
            id="projectDescription"
            name="projectDescription"
            value={formData.projectDescription}
            onChange={handleChange}
            required
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
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="submit-button"
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>
    </div>
  );
}

export default CreateProject;
