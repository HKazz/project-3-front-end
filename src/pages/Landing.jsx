import {useContext,useEffect, useState} from 'react'
import { authContext } from '../context/AuthContext'
import axios from 'axios'


function LandingPage() {
   const {user} = useContext(authContext);
   const [message, setMessage] = useState('');
   const [error, setError] = useState('')
  async function callProtectedRoute(){
    try {
      const token = localStorage.getItem("token")
      const response= await axios.get(`${import.meta.env.VITE_BACKEND_URL}/test-jwt/checkout`,{headers:{Authorization:`Bearer ${token}`}})
      console.log(response.data);
      setMessage(response.data.message || "Welcome to TaskHub")
    } catch (error) {
      setError("Failed to fetch data. Please log in")
    }
  }

  useEffect(() => {
    callProtectedRoute();
  }, []);

  return (
    <div>
      landing page
    </div>
  )
}

export default LandingPage
