import { useState } from 'react';

const Admin = () => {
  // Separate state for each input field
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    
    // For demo purposes - in your actual app, get these from environment variables
    const adminUsername = import.meta.env.VITE_ADMIN_USERNAME
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD

    if (username === adminUsername && password === adminPassword) {
      // Handle successful login
      // setIsAdminLoggedIn(true);
    } else {
      alert('Invalid credentials');
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full p-3 rounded-md font-medium ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => setCurrentView('volunteer')}
            className="text-blue-600 hover:text-blue-800"
            disabled={loading}
          >
            Back to Volunteer Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;