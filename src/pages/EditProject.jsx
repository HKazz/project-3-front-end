// EditProject.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function EditProject({ projectId }) {
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`/project/${projectId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProject(response.data);
      } catch (error) {
        console.error("Error fetching project", error);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `/project/${projectId}`, 
        project,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error updating project", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={project?.projectName || ""}
        onChange={(e) => setProject({ ...project, projectName: e.target.value })}
      />
      <textarea
        value={project?.projectDescription || ""}
        onChange={(e) => setProject({ ...project, projectDescription: e.target.value })}
      />
      <input
        type="date"
        value={project?.startDate || ""}
        onChange={(e) => setProject({ ...project, startDate: e.target.value })}
      />
      <input
        type="date"
        value={project?.endDate || ""}
        onChange={(e) => setProject({ ...project, endDate: e.target.value })}
      />
      <button type="submit">Save Changes</button>
    </form>
  );
}

export default EditProject;
