import { useState } from "react";
import { Mountain } from "lucide-react";

// Volunteer Registration Component
const Registration = ({ onRegister, onShowLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    childrenNames: '',
    trainingMountain: '',
    strengths: [],
    skiingAbility: '',
    preferredOpportunities: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.mobile || 
        !formData.password || !formData.trainingMountain || !formData.skiingAbility || 
        !formData.preferredOpportunities) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    onRegister(formData);
  };

  const handleStrengthChange = (strength) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths.includes(strength)
        ? prev.strengths.filter(s => s !== strength)
        : [...prev.strengths, strength]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <Mountain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Join Our Team</h2>
          <p className="text-gray-600 mt-2">Register to volunteer with Freestyle Vancouver</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input
                type="text"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input
                type="text"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mobile *</label>
            <input
              type="tel"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <input
                type="password"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password *</label>
              <input
                type="password"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Training Mountain *</label>
            <select
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.trainingMountain}
              onChange={(e) => setFormData({...formData, trainingMountain: e.target.value})}
            >
              <option value="">Select mountain</option>
              <option value="Whistler">Whistler</option>
              <option value="Cypress">Cypress</option>
              <option value="Grouse">Grouse</option>
              <option value="Seymour">Seymour</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Skiing Ability *</label>
            <select
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.skiingAbility}
              onChange={(e) => setFormData({...formData, skiingAbility: e.target.value})}
            >
              <option value="">Select ability level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preferred Opportunities *</label>
            <select
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.preferredOpportunities}
              onChange={(e) => setFormData({...formData, preferredOpportunities: e.target.value})}
            >
              <option value="">Select preference</option>
              <option value="On Snow">On Snow</option>
              <option value="Off Snow">Off Snow</option>
              <option value="Both">Both</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 font-medium"
          >
            Register as Volunteer
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Already registered?</p>
          <button
            onClick={onShowLogin}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registration;