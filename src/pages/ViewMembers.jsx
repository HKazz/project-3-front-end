import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {useNavigate, useParams} from 'react-router'
import {authContext} from '../context/AuthContext'
function ViewMembers() {
  const [members, setMembers] = useState([])
  const [error, setError] = useState(null)
  const {projectId} = useParams()
  useEffect(() => {
    async function fetchMembers() {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('No token found. Please log in.')
          return
        }
  
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/project/${projectId}/members`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
  
        if (response.data && response.data.length > 0) {
          setMembers(response.data)
        } else {
          setMembers([]) // Set empty array if no members are found
        }
      } catch (error) {
        console.error(error)
        setError('Failed to fetch members. Please try again later.')
      }
    }
  
    fetchMembers()
  }, [projectId])
  
  async function handleSubmit(e){
    e.preventDefault()
    try{
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`,formData)
        console.log(response.data)
        localStorage.setItem("token",response.data.token)
        validateToken()
    }
    catch(err){
        console.log(err)
    }
}
  return (
  <div>
    <h1>Project Members</h1>
    {error && <p style={{ color: 'red' }}>{error}</p>}
    {members.length === 0 ? (
      <p>No members found for this project.</p>
    ) : (
      <ul>
        {members.map((member) => (
          <li key={member.id}>{member.name}</li>
        ))}
      </ul>
    )}
  </div>
  )
}
export default ViewMembers