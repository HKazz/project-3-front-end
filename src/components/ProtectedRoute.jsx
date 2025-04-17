import { Navigate, Outlet } from "react-router-dom"
import { useContext } from "react"
import { authContext } from "../context/AuthContext"

function ProtectedRoute() {
  const { user } = useContext(authContext)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute 