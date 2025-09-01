import { useState } from "react";
import Login from "../../components/login/Login";
import Registration from "../../components/registration/Registration";
import logo from '../../assets/logo.png';
import {
  Calendar,
  Plus,
  Trash2,
  Users,
  Mountain,
  Phone,
  Mail,
  User,
  Settings,
  LogOut,
  Edit,
  Save,
  X,
  Check,
} from "lucide-react";

const Volunteer = () => {
  // State management
  const [currentView, setCurrentView] = useState("volunteer"); // 'volunteer' or 'admin'
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [isVolunteerLoggedIn, setIsVolunteerLoggedIn] = useState(false);
  const [currentVolunteer, setCurrentVolunteer] = useState(null);
  const [showVolunteerLogin, setShowVolunteerLogin] = useState(false);
  const [registeredVolunteers, setRegisteredVolunteers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);



  // Admin login state
  const [loginData, setLoginData] = useState({ username: "", password: "" });


  const handleVolunteerRegister = (volunteerData) => {
    const newVolunteer = {
      ...volunteerData,
      id: Date.now(),
    };
    setRegisteredVolunteers([...registeredVolunteers, newVolunteer]);
    setCurrentVolunteer(newVolunteer);
    setIsVolunteerLoggedIn(true);
    alert("Registration successful! Welcome to Freestyle Vancouver.");
  };

  const handleVolunteerLogin = (volunteer) => {
    setCurrentVolunteer(volunteer);
    setIsVolunteerLoggedIn(true);
    setShowVolunteerLogin(false);
  };

  const handleVolunteerLogout = () => {
    setIsVolunteerLoggedIn(false);
    setCurrentVolunteer(null);
  };

  // Quick signup function for logged-in volunteers
  const quickSignUp = (opportunityId) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    
    // Check if volunteer is already signed up
    const alreadySignedUp = opportunity.signedUp.some(vol => vol.id === currentVolunteer.id);
    if (alreadySignedUp) {
      alert("You are already signed up for this opportunity!");
      return;
    }

    // Check if opportunity is full
    if (opportunity.signedUp.length >= opportunity.maxVolunteers) {
      alert("This opportunity is already full!");
      return;
    }

    setOpportunities(
      opportunities.map((opp) =>
        opp.id === opportunityId
          ? {
              ...opp,
              signedUp: [
                ...opp.signedUp,
                { ...currentVolunteer, signupDate: new Date().toISOString() },
              ],
            }
          : opp
      )
    );
    
    alert(`Successfully signed up for ${opportunity.title}!`);
  };

  // Check if volunteer is signed up for an opportunity
  const isSignedUp = (opportunityId) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    return opportunity?.signedUp.some(vol => vol.id === currentVolunteer?.id) || false;
  };

  // Update your main return statement to include this logic at the top:
  if (!isVolunteerLoggedIn && currentView === "volunteer") {
    if (showVolunteerLogin) {
      return (
        <Login
          onLogin={handleVolunteerLogin}
          onShowRegister={() => setShowVolunteerLogin(false)}
          registeredVolunteers={registeredVolunteers}
        />
      );
    } else {
      return (
        <Registration
          onRegister={handleVolunteerRegister}
          onShowLogin={() => setShowVolunteerLogin(true)}
        />
      );
    }
  }

  const handleAdminLogin = () => {

     const adminUsername = import.meta.env.VITE_ADMIN_USERNAME;
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (
      loginData.username === adminUsername &&
      loginData.password === adminPassword
    ) {
      setIsAdminLoggedIn(true);
    } else {
      alert("Invalid credentials");
    }
  };

  // Add new opportunity
  const addOpportunity = (opportunityData) => {
    const newOpportunity = {
      id: Date.now(),
      ...opportunityData,
      signedUp: [],
    };
    setOpportunities([...opportunities, newOpportunity]);
    setShowOpportunityForm(false);
  };

  // Update opportunity
  const updateOpportunity = (id, updatedData) => {
    setOpportunities(
      opportunities.map((opp) =>
        opp.id === id ? { ...opp, ...updatedData } : opp
      )
    );
    setEditingOpportunity(null);
  };

  // Delete opportunity
  const deleteOpportunity = (id) => {
    if (window.confirm("Are you sure you want to delete this opportunity?")) {
      setOpportunities(opportunities.filter((opp) => opp.id !== id));
    }
  };

  // Get opportunities for selected date
  const getOpportunitiesForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return opportunities.filter((opp) => opp.date === dateStr);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayOpportunities = getOpportunitiesForDate(current);
      days.push({
        date: new Date(current),
        opportunities: dayOpportunities,
        isCurrentMonth: current.getMonth() === month,
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // Opportunity Form Component
  const OpportunityForm = ({ opportunity, onClose, onSubmit }) => {
    const [formData, setFormData] = useState(
      opportunity || {
        date: "",
        time: "",
        title: "",
        description: "",
        location: "",
        type: "",
        maxVolunteers: 1,
      }
    );

    const handleSubmit = () => {
      if (
        !formData.date ||
        !formData.time ||
        !formData.title ||
        !formData.description ||
        !formData.location ||
        !formData.type ||
        !formData.maxVolunteers
      ) {
        alert("Please fill in all required fields");
        return;
      }

      if (opportunity) {
        updateOpportunity(opportunity.id, formData);
      } else {
        onSubmit(formData);
      }
      onClose();
    };

    return (
      <div className="fixed h-screen inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              {opportunity ? "Edit" : "Add"} Opportunity
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input
                type="date"
                className="w-full p-2 border rounded-md"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Time *</label>
              <input
                type="time"
                className="w-full p-2 border rounded-md"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description *
              </label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows="3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Location *
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              >
                <option value="">Select location</option>
                <option value="Cypress">Cypress</option>
                <option value="Grouse">Grouse</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="">Select type</option>
                <option value="on-snow">On Snow</option>
                <option value="off-snow">Off Snow</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Max Volunteers *
              </label>
              <input
                type="number"
                min="1"
                className="w-full p-2 border rounded-md"
                value={formData.maxVolunteers}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxVolunteers: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {opportunity ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Admin Login Component
  const AdminLogin = () => (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md"
              placeholder="Enter username"
              value={loginData.username}
              onChange={(e) =>
                setLoginData({ ...loginData, username: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-md"
              placeholder="Enter password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
            />
          </div>
          <button
            onClick={handleAdminLogin}
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => setCurrentView("volunteer")}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Volunteer Portal
          </button>
        </div>
      </div>
    </div>
  );

  // Sidebar Component
  const Sidebar = () => {
    const todayOpportunities = getOpportunitiesForDate(new Date());
    const upcomingOpportunities = opportunities
      .filter((opp) => new Date(opp.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);

    return (
      <div className="w-80 bg-white shadow-sm border-l h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-6">
          {/* Volunteer Profile Section */}
          {currentView === "volunteer" && currentVolunteer && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <User size={20} className="mr-2 text-blue-600" />
                Welcome, {currentVolunteer.firstName}!
              </h3>
              <div className="text-sm text-gray-600">
                <p>{currentVolunteer.email}</p>
                <p>{currentVolunteer.trainingMountain}</p>
              </div>
              <button
                onClick={handleVolunteerLogout}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Logout
              </button>
            </div>
          )}

          <h3 className="text-lg font-semibold mb-4">Today's Opportunities</h3>
          {todayOpportunities.length > 0 ? (
            <div className="space-y-3">
              {todayOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{opportunity.title}</h4>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        opportunity.type === "on-snow"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {opportunity.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {opportunity.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {opportunity.time} • {opportunity.location}
                    </span>
                    <span>
                      {opportunity.signedUp.length}/{opportunity.maxVolunteers}
                    </span>
                  </div>
                  {currentView === "volunteer" && (
                    <>
                      {isSignedUp(opportunity.id) ? (
                        <div className="w-full mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded text-center flex items-center justify-center">
                          <Check size={16} className="mr-1" />
                          Signed Up
                        </div>
                      ) : opportunity.signedUp.length < opportunity.maxVolunteers ? (
                        <button
                          onClick={() => quickSignUp(opportunity.id)}
                          className="w-full mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Quick Sign Up
                        </button>
                      ) : (
                        <div className="w-full mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded text-center">
                          Full
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No opportunities today</p>
          )}

          <h3 className="text-lg font-semibold mb-4 mt-8">
            Upcoming Opportunities
          </h3>
          {upcomingOpportunities.length > 0 ? (
            <div className="space-y-3">
              {upcomingOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{opportunity.title}</h4>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        opportunity.type === "on-snow"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {opportunity.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {opportunity.date} • {opportunity.time}
                    </span>
                    <span>
                      {opportunity.signedUp.length}/{opportunity.maxVolunteers}
                    </span>
                  </div>
                  {currentView === "volunteer" && (
                    <>
                      {isSignedUp(opportunity.id) ? (
                        <div className="w-full mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded text-center flex items-center justify-center">
                          <Check size={16} className="mr-1" />
                          Signed Up
                        </div>
                      ) : opportunity.signedUp.length < opportunity.maxVolunteers ? (
                        <button
                          onClick={() => quickSignUp(opportunity.id)}
                          className="w-full mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Quick Sign Up
                        </button>
                      ) : (
                        <div className="w-full mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded text-center">
                          Full
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No upcoming opportunities</p>
          )}

          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-blue-600" />
                <span className="text-sm">(604) 555-0123</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-blue-600" />
                <span className="text-sm">
                  volunteers@freestylevancouver.ca
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const calendarDays = generateCalendarDays();

  if (currentView === "admin" && !isAdminLoggedIn) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Navigation */}
      <nav className="h-16 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
                <img src={logo} alt="#" className="h-14 w-25 text blue-600" />
              {/* <Mountain className="h-8 w-8 text-blue-600" /> */}
              <h1 className="text-xl font-bold text-gray-900">
                Freestyle Volunteer Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {currentView === "volunteer" ? (
                <>
                  {currentVolunteer && (
                    <span className="text-sm text-gray-600">
                      Welcome, {currentVolunteer.firstName}
                    </span>
                  )}
                  <button
                    onClick={() => setCurrentView("admin")}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    <Settings size={20} />
                    <span>Admin</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowOpportunityForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus size={20} />
                    <span>Add Opportunity</span>
                  </button>
                  <button
                    onClick={() => setCurrentView("volunteer")}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    <Users size={20} />
                    <span>Volunteer View</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAdminLoggedIn(false);
                      setCurrentView("volunteer");
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-800"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex  max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
                className="px-3 py-1 border rounded-md hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}
                className="px-3 py-1 border rounded-md hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-lg shadow">
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="bg-gray-50 p-3 text-center font-medium text-gray-700"
                >
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`bg-white p-2 min-h-[120px] ${
                    !day.isCurrentMonth ? "text-gray-400" : ""
                  }`}
                >
                  <div className="text-sm font-medium mb-2">
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {day.opportunities.map((opportunity) => (
                      <div
                        key={opportunity.id}
                        className={`text-xs p-1 rounded ${
                          opportunity.type === "on-snow"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        <div className="font-medium">{opportunity.time}</div>
                        <div className="truncate">{opportunity.title}</div>
                        <div className="text-xs">
                          {opportunity.signedUp.length}/
                          {opportunity.maxVolunteers} signed up
                        </div>
                        {currentView === "admin" && (
                          <div className="flex space-x-1 mt-1">
                            <button
                              onClick={() => setEditingOpportunity(opportunity)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => deleteOpportunity(opportunity.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                        {currentView === "volunteer" && (
                          <>
                            {isSignedUp(opportunity.id) ? (
                              <div className="w-full mt-1 px-1 py-0.5 bg-green-600 text-white text-xs rounded text-center flex items-center justify-center">
                                <Check size={10} className="mr-1" />
                                Signed Up
                              </div>
                            ) : opportunity.signedUp.length < opportunity.maxVolunteers ? (
                              <button
                                onClick={() => quickSignUp(opportunity.id)}
                                className="w-full mt-1 px-1 py-0.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              >
                                Quick Sign Up
                              </button>
                            ) : (
                              <div className="w-full mt-1 px-1 py-0.5 bg-gray-400 text-white text-xs rounded text-center">
                                Full
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Panel - Volunteer List */}
          {currentView === "admin" && (
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Volunteer Management</h3>
              {opportunities.map((opportunity) => (
                <div key={opportunity.id} className="mb-6 border-b pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{opportunity.title}</h4>
                      <p className="text-sm text-gray-600">
                        {opportunity.date} at {opportunity.time} -{" "}
                        {opportunity.location}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        opportunity.type === "on-snow"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {opportunity.type}
                    </span>
                  </div>
                  <div className="text-sm">
                    <strong>
                      Volunteers ({opportunity.signedUp.length}/
                      {opportunity.maxVolunteers}):
                    </strong>
                    {opportunity.signedUp.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {opportunity.signedUp.map((volunteer) => (
                          <div
                            key={volunteer.id}
                            className="bg-gray-50 p-3 rounded"
                          >
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <strong>Name:</strong> {volunteer.firstName}{" "}
                                {volunteer.lastName}
                              </div>
                              <div>
                                <strong>Email:</strong> {volunteer.email}
                              </div>
                              <div>
                                <strong>Phone:</strong> {volunteer.phone}
                              </div>
                              <div>
                                <strong>Training Mountain:</strong>{" "}
                                {volunteer.trainingMountain}
                              </div>
                              <div>
                                <strong>Signed Up:</strong>{" "}
                                {new Date(volunteer.signupDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 mt-1">No volunteers signed up yet</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>

      {/* Modals */}
      {showOpportunityForm && (
        <OpportunityForm
          onClose={() => setShowOpportunityForm(false)}
          onSubmit={addOpportunity}
        />
      )}

      {editingOpportunity && (
        <OpportunityForm
          opportunity={editingOpportunity}
          onClose={() => setEditingOpportunity(null)}
          onSubmit={updateOpportunity}
        />
      )}
    </div>
  );
};

export default Volunteer;
                                