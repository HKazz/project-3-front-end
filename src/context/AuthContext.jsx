import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

// 1. creating the context
const authContext = createContext()

function UserProvider(props){
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

    async function validateToken(){
        const token = localStorage.getItem("token")
        setLoading(true)

        if(!token){
            setUser(null)
            setLoading(false)
            return
        }

        try {
            const response = await axios.get(`${API_URL}/auth/verify`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setUser(response.data)
        } catch(err) {
            console.error("Token validation error:", err)
            setUser(null)
            localStorage.removeItem("token")
            if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                navigate("/login")
            }
        } finally {
            setLoading(false)
        }
    }

    async function login(credentials) {
        try {
            console.log("Attempting login with:", { username: credentials.username })
            const response = await axios.post(`${API_URL}/auth/login`, credentials)
            console.log("Login response:", response.data)
            
            if (!response.data.token) {
                throw new Error("No token received from server")
            }
            
            // Store the token
            localStorage.setItem("token", response.data.token)
            
            // Get user data
            const userResponse = await axios.get(`${API_URL}/auth/verify`, {
                headers: {
                    Authorization: `Bearer ${response.data.token}`
                }
            })
            
            setUser(userResponse.data)
            return { success: true }
        } catch (err) {
            console.error("Login error details:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                url: `${API_URL}/auth/login`
            })
            
            let errorMessage = "Failed to login. Please check your credentials."
            
            if (err.response?.status === 401) {
                errorMessage = err.response.data.err || "Invalid username or password"
            } else if (err.response?.status === 404) {
                errorMessage = "Login service not available. Please check if the server is running."
            } else if (err.response?.data?.err) {
                errorMessage = err.response.data.err
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error
            }
            
            return { 
                success: false, 
                error: errorMessage
            }
        }
    }

    async function signup(credentials) {
        try {
            console.log("Attempting signup with:", { username: credentials.username })
            const response = await axios.post(`${API_URL}/auth/sign-up`, credentials)
            console.log("Signup response:", response.data)
            return { success: true }
        } catch (err) {
            console.error("Signup error details:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                url: `${API_URL}/auth/sign-up`
            })
            
            let errorMessage = "Failed to sign up. Please try again."
            
            if (err.response?.status === 409) {
                errorMessage = "Username already exists"
            } else if (err.response?.status === 400) {
                errorMessage = "Invalid username or password format"
            } else if (err.response?.status === 404) {
                errorMessage = "Signup service not available. Please check if the server is running."
            } else if (err.response?.data?.err) {
                errorMessage = err.response.data.err
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error
            }
            
            return { 
                success: false, 
                error: errorMessage
            }
        }
    }

    function logout(){
        localStorage.removeItem("token")
        setUser(null)
        navigate("/login")
    }

    useEffect(() => {
        validateToken()
    }, [])

    const contextValues = {
        user,
        loading,
        login,
        signup,
        logout,
        validateToken
    }

    return (
        <authContext.Provider value={contextValues}>
            {props.children}
        </authContext.Provider>
    )
}

export { UserProvider, authContext }