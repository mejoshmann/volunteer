import { useState } from "react";
import logo from "../../assets/logo.png";
import { supabase }  from '../../lib/supabase'; 

// Sanitize user input to prevent XSS
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .slice(0, 500); // Limit length
};

// Validate password strength
const validatePasswordStrength = (password) => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*)';
  }
  return null;
}; 


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
  
  // Sanitize all text inputs
  const sanitizedData = {
    ...formData,
    firstName: sanitizeInput(formData.firstName),
    lastName: sanitizeInput(formData.lastName),
    email: formData.email.trim().toLowerCase(),
    mobile: sanitizeInput(formData.mobile),
    childrenNames: sanitizeInput(formData.childrenNames),
    preferredOpportunities: sanitizeInput(formData.preferredOpportunities)
  };
  
  // Validation
  if (!sanitizedData.firstName || !sanitizedData.lastName || !sanitizedData.email || !sanitizedData.mobile || 
      !sanitizedData.password || !sanitizedData.trainingMountain || !sanitizedData.skiingAbility || 
      !sanitizedData.preferredOpportunities) {
    setError('Please fill in all required fields');
    setLoading(false);
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitizedData.email)) {
    setError('Please enter a valid email address');
    setLoading(false);
    return;
  }

  // Phone validation (basic)
  const phoneRegex = /^[0-9\s\-\+\(\)]+$/;
  if (!phoneRegex.test(sanitizedData.mobile)) {
    setError('Please enter a valid phone number');
    setLoading(false);
    return;
  }

  if (sanitizedData.password !== sanitizedData.confirmPassword) {
    setError('Passwords do not match');
    setLoading(false);
    return;
  }

  // Strong password validation
  const passwordError = validatePasswordStrength(sanitizedData.password);
  if (passwordError) {
    setError(passwordError);
    setLoading(false);
    return;
  }

  try {
    
    // 1. Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: sanitizedData.email,
      password: sanitizedData.password,
      options: {
        data: {
          first_name: sanitizedData.firstName,
          last_name: sanitizedData.lastName,
        },
        emailRedirectTo: window.location.origin
      }
    });

    if (authError) throw authError;

    if (!authData.user) {
      throw new Error('No user data returned from authentication');
    }

    // Check if email confirmation is required
    if (authData.user.identities && authData.user.identities.length === 0) {
      // Email confirmation is required - don't try to insert volunteer data yet
      alert(`Registration initiated for ${sanitizedData.email}!

IMPORTANT: Email confirmation is enabled.

What to do next:
1. Check your email inbox (and spam folder)
2. Click the confirmation link in the email
3. After confirming, come back and log in

Note: If you don't receive an email within 5 minutes, please contact support or ask the administrator to disable email confirmation.`);
      onRegister(); // Call onRegister without data since we can't insert yet
      setLoading(false);
      return;
    }

    // If we get here, the user is confirmed and authenticated
    // Use the user ID from signup
    
    const userId = authData.user.id;

    // 2. Create volunteer profile
    // Add delay to ensure auth session is fully established
    await new Promise(resolve => setTimeout(resolve, 500));

    // Try to insert volunteer profile with retry logic
    let volunteerData = null;
    let insertError = null;
    
    for (let attempt = 0; attempt < 3; attempt++) {
      const volunteerRecord = {
        user_id: userId,
        first_name: sanitizedData.firstName,
        last_name: sanitizedData.lastName,
        email: sanitizedData.email,
        mobile: sanitizedData.mobile,
        children_names: sanitizedData.childrenNames || null,
        training_mountain: sanitizedData.trainingMountain,
        strengths: sanitizedData.strengths,
        skiing_ability: sanitizedData.skiingAbility,
        preferred_opportunities: sanitizedData.preferredOpportunities,
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('volunteers')
        .insert(volunteerRecord)
        .select()
        .single();

      if (error) {
        insertError = error;
        // Wait before retry
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        volunteerData = data;
        break;
      }
    }

    if (insertError && !volunteerData) {
      
      // Check if it's an RLS error
      if (insertError.code === '42501' || insertError.message?.includes('policy')) {
        throw new Error(`Database permissions error.

Error: ${insertError.message}

Please run FINAL_RLS_FIX.sql in Supabase to fix RLS policies.`);
      } else if (insertError.code === 'PGRST116') {
        throw new Error(`No rows returned. This might be an RLS issue.

Error: ${insertError.message}

Please run FINAL_RLS_FIX.sql in Supabase.`);
      } else if (insertError.message?.includes('406') || insertError.message?.includes('Not Acceptable')) {
        throw new Error(`HTTP 406 Error - RLS policy is blocking the insert.

Please run FINAL_RLS_FIX.sql in Supabase SQL Editor.

Technical details: ${insertError.message}`);
      } else {
        throw new Error(`Registration failed: ${insertError.message || 'Unknown error'}\n\nPlease check the console for details and contact support if this persists.`);
      }
    }

    // Success!
    onRegister({
      ...sanitizedData,
      id: volunteerData.id,
      status: 'pending'
    });
    alert('Registration successful!\n\nYour volunteer profile has been created.\n\nPlease check your email for confirmation link.');

  } catch (err) {
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
    { name: 'First Aid', description: 'Provide medical assistance and safety support' },
    { name: 'Snow Shovelling', description: 'Clear snow from training areas paths and ensure safe conditions' },
    { name: 'Lunch Support', description: 'Supervise athletes during breaks' },
    { name: 'Equipment Support', description: 'Help with equipment setup and teardown' },
    { name: 'Coordinator', description: 'Roll-call of athletes and volunteer coordination'}
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
                <label key={strength.name} className="flex items-center space-x-2 group relative">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.strengths.includes(strength.name)}
                    onChange={() => handleStrengthChange(strength.name)}
                    disabled={loading}
                  />
                  <span className="text-sm">{strength.name}</span>
                  <div className="relative inline-block">
                    <span className="inline-flex items-center justify-center w-4 h-4 text-xs text-gray-500 border border-gray-400 rounded-full cursor-help hover:bg-gray-100 hover:text-gray-700">
                      ?
                    </span>
                    <div className="absolute left-6 top-0 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-2 px-3 w-48 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {strength.description}
                      <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                  </div>
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