import { useState } from 'react';
import { Mountain } from 'lucide-react';

const Login = ({ onLogin, onShowRegister, registeredVolunteers }) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    
    const volunteer = registeredVolunteers.find(v => 
      v.email === loginData.email && v.password === loginData.password
    );
    
    if (volunteer) {
      onLogin(volunteer);
    } else {
      alert('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <Mountain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to access volunteer opportunities</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 font-medium"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">New volunteer?</p>
          <button
            onClick={onShowRegister}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};



export default Login;