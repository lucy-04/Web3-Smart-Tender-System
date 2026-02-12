import React from 'react'
import { useNavigate } from 'react-router-dom'
const Homepage = () => {
    const navigate = useNavigate()
  return (
    <div>
        <h1>Homepage</h1>
        <p>Welcome to the Web3 Tender System</p>
        <button onClick={() => navigate('/login')}>Login</button>
        <button onClick={() => navigate('/register')}> Register</button>
    </div>
  )
}

export default Homepage