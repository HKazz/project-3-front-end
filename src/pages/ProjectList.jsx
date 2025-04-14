import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProjectList() {
  const [projects, setProjects]= useState([]);
  const [error, setError]= useState('');

  useEffect(()=>{
    async function getProjects() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/projects`,{
          headers: {Authorization: `Bearer ${token}`},
        })
        setProjects(response.data)
      } catch (error) {
        setError("Failed to fetch projects. Please try again")
        console.error(error)
      }
    }

    getProjects();
  })
  return (
    <div>
      <h1>Your Projects</h1>
     <ul>
      {projects.map((project)=>(
        <li key={project._id}>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
        </li>
      ))}
     </ul>
    </div>
  )
}

export default ProjectList
