import React, { useEffect, useState } from 'react';
import axios from 'axios';
function ProjectList() {
  const [projects, setProjects]= useState([]);
  const [error, setError]= useState('');
  useEffect(()=>{
    async function getProjects() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/project`,{
          headers: {Authorization: `Bearer ${token}`},
        })
        console.log(response.data)
        setProjects(response.data)
      } catch (error) {
        setError("Failed to fetch projects. Please try again")
        console.error(error)
      }
    }
    getProjects();
  },[])
  return (
    <div>
      <h1>Your Projects</h1>
     <ul>
      {projects.map((project)=>(
        <li key={project._id}>
          <a><h3>{project.projectName}</h3></a>
          <p>{project.projectDescription}</p>
        </li>
      ))}
     </ul>
    </div>
  )
}
export default ProjectList