import { useState } from "react";
import logo from "../../assets/logo.png";
import { supabase }  from '../../lib/supabase'; 


const Registration = ({ onRegister = () => {}, onShowLogin = () => {} }) => {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  // Validation - put this back!
  if (!formData.firstName || !formData.lastName || !formData.email || !formData.mobile || 
      !formData.password || !formData.trainingMountain || !formData.skiingAbility || 
      !formData.preferredOpportunities) {
    setError('Please fill in all required fields');
    setLoading(false);
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    setLoading(false);
    return;
  }

  if (formData.password.length < 6) {
    setError('Password must be at least 6 characters');
    setLoading(false);
    return;
  }

  try {
    console.log('Starting registration...');
    
    // 1. Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
        emailRedirectTo: window.location.origin // Redirect back to app after email confirmation
      }
    });

    console.log('Auth response:', authData, authError);

    if (authError) throw authError;

    if (!authData.user) {
      throw new Error('No user data returned from authentication');
    }

    // Check if email confirmation is required
    if (authData.user.identities && authData.user.identities.length === 0) {
      // Email confirmation is required - don't try to insert volunteer data yet
      alert('Registration successful! Please check your email to confirm your account, then you can log in.');
      onRegister(); // Call onRegister without data since we can't insert yet
      setLoading(false);
      return;
    }

    // If we get here, the user is confirmed and authenticated
    // Use the user ID from signup
    const userId = authData.user.id;
    console.log('User ID:', userId);

    // Small delay to ensure auth state is properly set
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Insert volunteer profile data
    const volunteerRecord = {
      user_id: userId,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      mobile: formData.mobile,
      children_names: formData.childrenNames || null,
      training_mountain: formData.trainingMountain,
      strengths: formData.strengths,
      skiing_ability: formData.skiingAbility,
      preferred_opportunities: formData.preferredOpportunities,
      status: 'pending',
    };

    console.log('About to insert:', volunteerRecord);

    const { data: volunteerData, error: volunteerError } = await supabase
      .from('volunteers')
      .insert(volunteerRecord)
      .select()
      .single();

    console.log('Insert response:', volunteerData, volunteerError);

    if (volunteerError) {
      // If it's an RLS error, provide helpful message
      if (volunteerError.code === '42501') {
        console.log('RLS error - database permissions issue');
        // Try one more time with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data: retryData, error: retryError } = await supabase
          .from('volunteers')
          .insert(volunteerRecord)
          .select()
          .single();
          
        if (retryError) {
          throw new Error('Registration failed due to database permissions. Please contact support.');
        }
        // Success on retry
        onRegister({
          ...formData,
          id: retryData.id,
          status: 'pending'
        });
        alert('Registration successful! You can now log in.');
      } else {
        throw volunteerError;
      }
    } else {
      // Success! Call the parent callback
      onRegister({
        ...formData,
        id: volunteerData.id,
        status: 'pending'
      });
      alert('Registration successful! You can now log in.');
    }

  } catch (err) {
    console.error('Registration error:', err);
    setError(err.message || 'Registration failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleStrengthChange = (strength) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths.includes(strength)
        ? prev.strengths.filter(s => s !== strength)
        : [...prev.strengths, strength]
    }));
  };

  const strengthOptions = [
    'First Aid',
    'Equipment Management',
    'Event Organization',
    'Snow Shovelling',
    'Lunch Detail',
    'Coordinator'
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="h-15 w-28 mx-auto mb-4 flex items-center justify-center">
            <img src={logo}/>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Join Our Team</h2>
          <p className="text-gray-600 mt-2">Register to volunteer with Freestyle Vancouver</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input
                type="text"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input
                type="text"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mobile *</label>
            <input
              type="tel"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              disabled={loading}
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
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password *</label>
              <input
                type="password"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Children's Names (optional)</label>
            <input
              type="text"
              placeholder="Names of your children (if applicable)"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.childrenNames}
              onChange={(e) => setFormData({...formData, childrenNames: e.target.value})}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Training Mountain *</label>
            <select
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.trainingMountain}
              onChange={(e) => setFormData({...formData, trainingMountain: e.target.value})}
              disabled={loading}
            >
              <option value="">Select mountain</option>
              <option value="Cypress">Cypress</option>
              <option value="Grouse">Grouse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Strengths (select all that apply)</label>
            <div className="grid grid-cols-2 gap-2">
              {strengthOptions.map(strength => (
                <label key={strength} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.strengths.includes(strength)}
                    onChange={() => handleStrengthChange(strength)}
                    disabled={loading}
                  />
                  <span className="text-sm">{strength}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Skiing Ability *</label>
            <select
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.skiingAbility}
              onChange={(e) => setFormData({...formData, skiingAbility: e.target.value})}
              disabled={loading}
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
              disabled={loading}
            >
              <option value="">Select preference</option>
              <option value="On Snow">On Snow</option>
              <option value="Off Snow">Off Snow</option>
              <option value="Both">Both</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full p-3 rounded-md font-medium ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {loading ? 'Creating Account...' : 'Register as Volunteer'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Already registered?</p>
          <button
            onClick={onShowLogin}
            className="text-blue-600 hover:text-blue-800 font-medium"
            disabled={loading}
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registration;