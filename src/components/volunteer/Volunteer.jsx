import { useState, useEffect } from "react";
import logo from '../../assets/logo.png';
import { supabase, volunteerService, opportunityService, signupService, chatService } from '../../lib/supabase';
import Chat from './Chat';
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
  CalendarPlus,
  Download,
  ChevronDown,
  Menu,
  X as CloseIcon,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Send,
} from "lucide-react";

// Admin Login Component - Moved outside to prevent re-renders
const AdminLogin = ({ loginData, setLoginData, handleAdminLogin, setCurrentView }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
    <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-200">
      <div className="text-center mb-8">
        <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings size={32} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Admin Portal</h2>
        <p className="text-gray-600 mt-2">Manage volunteer opportunities</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Username</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Enter admin username"
            value={loginData.username}
            onChange={(e) =>
              setLoginData({ ...loginData, username: e.target.value })
            }
            autoComplete="username"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Password</label>
          <input
            type="password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Enter admin password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            autoComplete="current-password"
            onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
          />
        </div>
        <button
          onClick={handleAdminLogin}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
        >
          Login to Admin
        </button>
      </div>
      <div className="mt-6 text-center">
        <button
          onClick={() => setCurrentView("volunteer")}
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          ← Back to Volunteer Portal
        </button>
      </div>
    </div>
  </div>
);

// Team Chat Form Component - Moved outside to prevent re-renders
const TeamChatForm = ({ onClose, onChatRoomsUpdate, onRoomCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedVolunteers: []
  });
  const [loading, setLoading] = useState(false);
  const [allVolunteers, setAllVolunteers] = useState([]);

  // Load all volunteers when form opens
  useEffect(() => {
    const loadVolunteers = async () => {
      try {
        const vols = await volunteerService.getAllVolunteers();
        setAllVolunteers(vols);
      } catch (error) {
        console.error('Failed to load volunteers:', error);
      }
    };
    loadVolunteers();
  }, []);

  const handleSubmit = async () => {
    if (!formData.name || formData.selectedVolunteers.length === 0) {
      alert('Please enter a team name and select at least one volunteer');
      return;
    }

    setLoading(true);
    try {
      const newRoom = await chatService.createTeamChatRoom(
        formData.name,
        formData.description,
        formData.selectedVolunteers
      );
      
      // Reload chat rooms
      const rooms = await chatService.getUserChatRooms();
      onChatRoomsUpdate(rooms);
      
      // Find and select the newly created room
      const createdRoom = rooms.find(r => r.id === newRoom.id);
      if (createdRoom && onRoomCreated) {
        onRoomCreated(createdRoom);
      }
      
      alert(`Team chat "${formData.name}" created successfully!`);
      onClose();
    } catch (error) {
      alert(`Failed to create team chat: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleVolunteer = (volunteerId) => {
    setFormData(prev => ({
      ...prev,
      selectedVolunteers: prev.selectedVolunteers.includes(volunteerId)
        ? prev.selectedVolunteers.filter(id => id !== volunteerId)
        : [...prev.selectedVolunteers, volunteerId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-4 w-full max-w-2xl my-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold">Create Team Chat</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Team Name *</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Cypress Coaches, Weekend Warriors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the team"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Team Members *</label>
            <div className="border rounded-md p-3 max-h-64 overflow-y-auto">
              {allVolunteers.length === 0 ? (
                <p className="text-sm text-gray-500">Loading volunteers...</p>
              ) : (
                <div className="space-y-2">
                  {allVolunteers.map(volunteer => (
                    <label
                      key={volunteer.id}
                      className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedVolunteers.includes(volunteer.id)}
                        onChange={() => toggleVolunteer(volunteer.id)}
                        className="mr-3 h-4 w-4 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {volunteer.first_name} {volunteer.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {volunteer.training_mountain} • {volunteer.email}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.selectedVolunteers.length} volunteer(s) selected
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Team Chat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Volunteer = ({ user, onLogout }) => {
  // State management
  const [currentView, setCurrentView] = useState("volunteer"); // 'volunteer' or 'admin'
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [currentVolunteer, setCurrentVolunteer] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [openCalendarDropdown, setOpenCalendarDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileView, setMobileView] = useState("calendar"); // 'calendar' or 'day' or 'chat'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dayOfWeekFilter, setDayOfWeekFilter] = useState("all"); // Filter for days of the week
  
  // Chat state
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatSubscription, setChatSubscription] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadMessageId, setLastReadMessageId] = useState(null);
  
  // Team management state
  const [showTeamChatForm, setShowTeamChatForm] = useState(false);

  // Track date range for loading opportunities
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    return {
      start: new Date(today.getFullYear(), today.getMonth() - 2, 1),
      end: new Date(today.getFullYear(), today.getMonth() + 3, 0)
    };
  });

  // Load opportunities for a specific date range
  const loadOpportunitiesForRange = async (startDate, endDate) => {
    try {
      const opps = await opportunityService.getOpportunitiesWithSignups(startDate, endDate);
      setOpportunities(opps);
    } catch (error) {
      alert('Error loading opportunities. Please try again.');
    }
  };

  // Update date range when month changes
  const handleMonthChange = (newDate) => {
    setSelectedDate(newDate);
    
    // Check if we need to load more data
    const newMonth = newDate.getMonth();
    const newYear = newDate.getFullYear();
    const rangeStart = dateRange.start;
    const rangeEnd = dateRange.end;
    
    // Expand range if navigating outside current range
    if (newDate < rangeStart || newDate > rangeEnd) {
      const newStart = new Date(newYear, newMonth - 2, 1);
      const newEnd = new Date(newYear, newMonth + 3, 0);
      setDateRange({ start: newStart, end: newEnd });
      loadOpportunitiesForRange(newStart, newEnd);
    }
  };

  // Check for mobile on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load volunteer profile
      const volunteer = await volunteerService.getCurrentVolunteer();
      
      if (!volunteer) {
        alert('No volunteer profile found. This may happen if:\n\n1. You registered but your profile wasn\'t created due to RLS policies\n2. Your account needs to be set up\n\nPlease try logging out and registering again, or contact support.');
        // Still load opportunities so user can see the calendar
      }
      
      setCurrentVolunteer(volunteer);

      // Load opportunities with date filtering (current month ± 2 months for performance)
      const opps = await opportunityService.getOpportunitiesWithSignups();
      setOpportunities(opps);
      
      // Load chat rooms
      if (volunteer) {
        try {
          const rooms = await chatService.getUserChatRooms();
          setChatRooms(rooms);
          // Auto-select Club Notifications room if available
          const clubNotifications = rooms.find(r => r.type === 'club_notifications');
          if (clubNotifications) {
            setSelectedChatRoom(clubNotifications);
          }
        } catch (chatError) {
          console.error('Failed to load chat rooms:', chatError);
        }
      }
    } catch (error) {
      alert('Error loading data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  // Quick signup function with optimistic updates
  const quickSignUp = async (opportunityId) => {
    // Check if volunteer profile exists
    if (!currentVolunteer) {
      alert('No volunteer profile found. Please log out and register again, or contact support if the issue persists.');
      return;
    }
    
    // Optimistic update - immediately update UI
    const optimisticSignup = {
      id: `temp-${Date.now()}`,
      volunteer: {
        id: currentVolunteer.id,
        user_id: user.id,
        first_name: currentVolunteer.first_name,
        last_name: currentVolunteer.last_name,
        email: currentVolunteer.email,
        mobile: currentVolunteer.mobile,
        training_mountain: currentVolunteer.training_mountain
      },
      signed_up_at: new Date().toISOString()
    };

    setOpportunities(prev => prev.map(opp => {
      if (opp.id === opportunityId) {
        return {
          ...opp,
          signups: [...(opp.signups || []), optimisticSignup]
        };
      }
      return opp;
    }));
    
    try {
      await signupService.signUpForOpportunity(opportunityId);
      // Reload only this opportunity's data to sync
      const opps = await opportunityService.getOpportunitiesWithSignups();
      setOpportunities(opps);
    } catch (error) {
      // Revert optimistic update on error
      setOpportunities(prev => prev.map(opp => {
        if (opp.id === opportunityId) {
          return {
            ...opp,
            signups: (opp.signups || []).filter(s => s.id !== optimisticSignup.id)
          };
        }
        return opp;
      }));
      alert(error.message || 'Failed to sign up. Please try again.');
    }
  };

  // Remove signup with optimistic updates
  const removeSignup = async (opportunityId) => {
    // Store original state for rollback
    const originalOpportunities = [...opportunities];

    // Optimistic update - immediately remove from UI
    setOpportunities(prev => prev.map(opp => {
      if (opp.id === opportunityId) {
        return {
          ...opp,
          signups: (opp.signups || []).filter(signup => 
            !(signup.volunteer && signup.volunteer.user_id === user.id)
          )
        };
      }
      return opp;
    }));

    try {
      await signupService.removeSignup(opportunityId);
      // Reload to sync with server
      const opps = await opportunityService.getOpportunitiesWithSignups();
      setOpportunities(opps);
    } catch (error) {
      // Revert optimistic update on error
      setOpportunities(originalOpportunities);
      alert(error.message || 'Failed to remove signup. Please try again.');
    }
  };

  // Check if volunteer is signed up for an opportunity
  const isSignedUp = (opportunity) => {
    if (!currentVolunteer || !opportunity.signups) return false;
    return opportunity.signups.some(signup => 
      signup.volunteer && signup.volunteer.user_id === user.id
    );
  };

  // Generate calendar links for an opportunity
  const generateCalendarLinks = (opportunity) => {
    const startDate = new Date(`${opportunity.date}T${opportunity.time}`);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2); // Default 2-hour duration

    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const title = encodeURIComponent(opportunity.title);
    const description = encodeURIComponent(
      `${opportunity.description}

Location: ${opportunity.location}
Type: ${opportunity.type}

Freestyle Vancouver Volunteer Opportunity`
    );
    const location = encodeURIComponent(opportunity.location);
    const dates = `${formatDate(startDate)}/${formatDate(endDate)}`;

    return {
      google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${description}&location=${location}`,
      apple: `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:${formatDate(startDate)}%0ADTEND:${formatDate(endDate)}%0ASUMMARY:${title}%0ADESCRIPTION:${description}%0ALOCATION:${location}%0AEND:VEVENT%0AEND:VCALENDAR`,
      outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${formatDate(startDate)}&enddt=${formatDate(endDate)}&body=${description}&location=${location}`,
    };
  };

  // Download all shifts as ICS file
  const downloadAllShiftsAsICS = () => {
    const myShifts = opportunities.filter((opp) => isSignedUp(opp));
    
    if (myShifts.length === 0) {
      alert('No shifts to download');
      return;
    }

    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    let icsContent = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Freestyle Vancouver//Volunteer Shifts//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n';
    
    myShifts.forEach(opp => {
      const startDate = new Date(`${opp.date}T${opp.time}`);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 2);

      icsContent += 'BEGIN:VEVENT\r\n';
      icsContent += `UID:${opp.id}@freestylevancouver.ski\r\n`;
      icsContent += `DTSTAMP:${formatDate(new Date())}\r\n`;
      icsContent += `DTSTART:${formatDate(startDate)}\r\n`;
      icsContent += `DTEND:${formatDate(endDate)}\r\n`;
      icsContent += `SUMMARY:${opp.title}\r\n`;
      icsContent += `DESCRIPTION:${opp.description}

Location: ${opp.location}
Type: ${opp.type}

Freestyle Vancouver Volunteer Opportunity\r
`;
      icsContent += `LOCATION:${opp.location}\r\n`;
      icsContent += 'STATUS:CONFIRMED\r\n';
      icsContent += 'END:VEVENT\r\n';
    });
    
    icsContent += 'END:VCALENDAR';

    // Create download link
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'freestyle-vancouver-volunteer-shifts.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chat functions
  const loadChatMessages = async (roomId) => {
    try {
      const msgs = await chatService.getChatMessages(roomId);
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChatRoom) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately

    try {
      const sentMessage = await chatService.sendMessage(selectedChatRoom.id, messageContent);
      // Optimistically add message to local state immediately
      setMessages(prev => [...prev, sentMessage]);
    } catch (error) {
      alert('Failed to send message. Please try again.');
      setNewMessage(messageContent); // Restore message on error
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await chatService.deleteMessage(messageId);
      // Remove message from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      alert('Failed to delete message. Please try again.');
    }
  };

  // Load messages when chat room changes
  useEffect(() => {
    if (selectedChatRoom) {
      loadChatMessages(selectedChatRoom.id);
      
      // Subscribe to real-time messages
      const subscription = chatService.subscribeToMessages(
        selectedChatRoom.id,
        (newMsg) => {
          setMessages(prev => {
            // Prevent duplicates - check if message already exists
            if (prev.some(msg => msg.id === newMsg.id)) {
              return prev;
            }
            const updated = [...prev, newMsg];
            // Increment unread count if chat is closed and message is not from current user
            if (!chatOpen && newMsg.sender?.id !== currentVolunteer?.id) {
              setUnreadCount(c => c + 1);
            }
            return updated;
          });
        }
      );
      
      setChatSubscription(subscription);
      
      // Cleanup on unmount or room change
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [selectedChatRoom, chatOpen, currentVolunteer]);

  // SECURITY WARNING: Client-side admin authentication is insecure!
  // This should be replaced with proper server-side authentication
  // Anyone with browser dev tools can bypass this
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
  const addOpportunity = async (opportunityData) => {
    try {
      const createdOpp = await opportunityService.createOpportunity(opportunityData);
      return createdOpp; // Return the created opportunity
    } catch (error) {
      // Show more detailed error message
      const errorMessage = error.message || 'Failed to create opportunity. Please try again.';
      alert(`Error: ${errorMessage}\n\nDetails: ${error.details || error.hint || 'No additional details'}`);
      throw error; // Re-throw to stop batch creation if one fails
    }
  };

  // Wrapper to handle UI updates after opportunity creation
  const handleOpportunityCreated = async () => {
    setShowOpportunityForm(false);
    // Reload opportunities
    const opps = await opportunityService.getOpportunitiesWithSignups();
    setOpportunities(opps);
    alert('Opportunity created successfully!');
  };

  // Update opportunity
  const updateOpportunity = async (id, updatedData) => {
    try {
      await opportunityService.updateOpportunity(id, updatedData);
      setEditingOpportunity(null);
      // Reload opportunities
      const opps = await opportunityService.getOpportunitiesWithSignups();
      setOpportunities(opps);
      alert('Opportunity updated successfully!');
    } catch (error) {
      alert('Failed to update opportunity. Please try again.');
    }
  };

  // Delete opportunity
  const deleteOpportunity = async (id) => {
    if (window.confirm("Are you sure you want to delete this opportunity?")) {
      try {
        await opportunityService.deleteOpportunity(id);
        // Reload opportunities
        const opps = await opportunityService.getOpportunitiesWithSignups();
        setOpportunities(opps);
        alert('Opportunity deleted successfully!');
      } catch (error) {
        alert('Failed to delete opportunity. Please try again.');
      }
    }
  };

  // Helper function to parse date string in local timezone
  const parseLocalDate = (dateStr) => {
    const parts = dateStr.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  // Get opportunities for selected date
  const getOpportunitiesForDate = (date) => {
    // Format date in local timezone to avoid UTC conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
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

  // Mobile Day View Component
  const MobileDayView = ({ day }) => {
    const isToday = day.date.toDateString() === new Date().toDateString();
    const dayOpportunities = getOpportunitiesForDate(day.date);
    
    return (
      <div className={`bg-white p-4 border-b ${isToday ? "border-blue-500 border-l-4" : "border-gray-200"}`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className={`font-bold ${isToday ? "text-blue-600" : "text-gray-900"}`}>
            {day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          {isToday && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Today</span>
          )}
        </div>
        
        {dayOpportunities.length > 0 ? (
          <div className="space-y-3">
            {dayOpportunities.map((opportunity) => {
              const signedUpCount = opportunity.signups ? opportunity.signups.length : 0;
              const userIsSignedUp = isSignedUp(opportunity);
              const isFull = signedUpCount >= opportunity.max_volunteers;
              const calLinks = generateCalendarLinks(opportunity);
              
              return (
                <div 
                  key={opportunity.id} 
                  className={`p-3 rounded-lg border ${
                    opportunity.type === "on-snow"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-green-50 border-green-200"
                  } ${userIsSignedUp ? "ring-2 ring-green-500" : ""}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900">{opportunity.title}</h4>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar size={14} className="mr-1" />
                        <span>{opportunity.time}</span>
                        <span className="mx-2">•</span>
                        <Mountain size={14} className="mr-1" />
                        <span>{opportunity.location}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        opportunity.type === "on-snow"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {opportunity.type === "on-snow" ? "On Snow" : "Off Snow"}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <p>{opportunity.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm">
                      <span className="font-medium">
                        {signedUpCount}/{opportunity.max_volunteers} spots filled
                      </span>
                    </div>
                  </div>
                  
                  {currentView === "volunteer" && (
                    <div className="space-y-2">
                      {userIsSignedUp ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => removeSignup(opportunity.id)}
                            className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium flex items-center justify-center"
                          >
                            <X size={16} className="mr-1" />
                            Remove Signup
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setOpenCalendarDropdown(
                                openCalendarDropdown === `mobile-${opportunity.id}` ? null : `mobile-${opportunity.id}`
                              )}
                              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium flex items-center"
                            >
                              <CalendarPlus size={16} className="mr-1" />
                              Add to Calendar
                            </button>
                            {openCalendarDropdown === `mobile-${opportunity.id}` && (
                              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                <a
                                  href={calLinks.google}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block px-4 py-2 text-sm hover:bg-gray-50 border-b border-gray-100"
                                  onClick={() => setOpenCalendarDropdown(null)}
                                >
                                  📅 Google Calendar
                                </a>
                                <a
                                  href={calLinks.apple}
                                  download={`${opportunity.title}.ics`}
                                  className="block px-4 py-2 text-sm hover:bg-gray-50 border-b border-gray-100"
                                  onClick={() => setOpenCalendarDropdown(null)}
                                >
                                  🍎 Apple Calendar
                                </a>
                                <a
                                  href={calLinks.outlook}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block px-4 py-2 text-sm hover:bg-gray-50 rounded-b-lg"
                                  onClick={() => setOpenCalendarDropdown(null)}
                                >
                                  📧 Outlook Calendar
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : isFull ? (
                        <div className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg text-center font-medium">
                          Opportunity Full
                        </div>
                      ) : (
                        <button
                          onClick={() => quickSignUp(opportunity.id)}
                          className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium"
                        >
                          Sign Up for This Shift
                        </button>
                      )}
                    </div>
                  )}
                  
                  {currentView === "admin" && (
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => setEditingOpportunity(opportunity)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteOpportunity(opportunity.id)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium flex items-center justify-center"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No volunteer opportunities scheduled for this day</p>
          </div>
        )}
      </div>
    );
  };

  // Mobile Calendar View Component
  const MobileCalendarView = () => {
    return (
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() - 1);
              handleMonthChange(newDate);
            }}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-bold text-gray-900">
            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </h2>
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() + 1);
              handleMonthChange(newDate);
            }}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <div
                key={day}
                className="bg-gray-50 p-2 text-center font-semibold text-gray-700 text-xs"
              >
                {day}
              </div>
            ))}
            {calendarDays.map((day, index) => {
              const isToday = day.date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={index}
                  className={`bg-white p-1 min-h-[80px] ${
                    !day.isCurrentMonth ? "bg-gray-50" : ""
                  } ${isToday ? "ring-2 ring-blue-500 ring-inset" : ""}`}
                  onClick={() => {
                    setSelectedDate(day.date);
                    setMobileView("day");
                  }}
                >
                  <div className={`text-xs font-semibold mb-1 ${
                    !day.isCurrentMonth ? "text-gray-400" : isToday ? "text-blue-600" : "text-gray-900"
                  }`}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {day.opportunities.slice(0, 3).map((opportunity) => (
                      <div
                        key={opportunity.id}
                        className={`text-[11px] p-1 rounded truncate ${
                          opportunity.type === "on-snow"
                            ? "bg-blue-100 text-blue-900"
                            : "bg-green-100 text-green-900"
                        }`}
                      >
                        {opportunity.time}
                      </div>
                    ))}
                    {day.opportunities.length > 3 && (
                      <div className="text-[11px] text-gray-500 text-center">
                        +{day.opportunities.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
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
        max_volunteers: 1,
      }
    );
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringEndDate, setRecurringEndDate] = useState("");

    // Sanitize text input to prevent XSS
    const sanitizeText = (text) => {
      if (typeof text !== 'string') return text;
      return text.trim().replace(/[<>]/g, '').slice(0, 500);
    };

    const handleSubmit = () => {
      
      // Sanitize inputs
      const sanitizedData = {
        ...formData,
        title: sanitizeText(formData.title),
        description: sanitizeText(formData.description)
      };
      
      if (
        !sanitizedData.date ||
        !sanitizedData.time ||
        !sanitizedData.title ||
        !sanitizedData.description ||
        !sanitizedData.location ||
        !sanitizedData.type ||
        !sanitizedData.max_volunteers
      ) {
        alert("Please fill in all required fields");
        return;
      }

      if (isRecurring && !recurringEndDate) {
        alert("Please select an end date for recurring opportunities");
        return;
      }

      if (isRecurring && new Date(recurringEndDate) <= new Date(formData.date)) {
        alert("End date must be after the start date");
        return;
      }

      if (opportunity) {
        // Editing existing opportunity
        updateOpportunity(opportunity.id, sanitizedData);
        onClose();
      } else {
        // Creating new opportunity
        if (isRecurring) {
          // Create multiple opportunities (async, don't close form yet)
          createRecurringOpportunities(sanitizedData, recurringEndDate);
        } else {
          // Create single opportunity
          onSubmit(sanitizedData);
          onClose();
          handleOpportunityCreated();
        }
      }
    };

    const createRecurringOpportunities = async (baseData, endDate) => {
      const startDate = new Date(baseData.date);
      const end = new Date(endDate);
      const opportunities = [];
      
      let currentDate = new Date(startDate);
      
      while (currentDate <= end) {
        opportunities.push({
          ...baseData,
          date: currentDate.toISOString().split('T')[0]
        });
        
        // Move to next week (add 7 days)
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 7);
      }
      
      try {
        // Create all opportunities
        let created = 0;
        for (const oppData of opportunities) {
          await onSubmit(oppData);
          created++;
        }
        
        // Close form and reload after all created
        await handleOpportunityCreated();
        alert(`Successfully created ${created} recurring opportunities!`);
      } catch (error) {
        alert(`Failed to create all opportunities. Created some successfully, but encountered an error.`);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg p-4 w-full max-w-md my-4">
          <div className="flex justify-between items-center mb-3">
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

          <div className="space-y-3">
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
                value={formData.max_volunteers}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_volunteers: parseInt(e.target.value),
                  })
                }
              />
            </div>

            {/* Recurring Opportunity Section */}
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="recurring" className="text-sm font-medium">
                  Create recurring weekly opportunities
                </label>
              </div>
              
              {isRecurring && (
                <div className="ml-6 space-y-2">
                  <p className="text-xs text-gray-600 mb-2">
                    This will create this opportunity every week starting from the selected date.
                  </p>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Repeat until (End Date) *
                    </label>
                    <input
                      type="date"
                      className="w-full p-2 border rounded-md"
                      value={recurringEndDate}
                      onChange={(e) => setRecurringEndDate(e.target.value)}
                      min={formData.date}
                    />
                  </div>
                  {formData.date && recurringEndDate && (
                    <p className="text-xs text-blue-600">
                      Will create {Math.ceil((new Date(recurringEndDate) - new Date(formData.date)) / (7 * 24 * 60 * 60 * 1000)) + 1} opportunities
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-3">
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

  // Sidebar Component
  const Sidebar = () => {
    const todayOpportunities = getOpportunitiesForDate(new Date());
    
    // Filter upcoming opportunities by day of week
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for comparison
    
    let upcomingOpportunities = opportunities
      .filter((opp) => {
        const oppDate = parseLocalDate(opp.date);
        oppDate.setHours(0, 0, 0, 0);
        return oppDate >= today;
      })
      .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
    
    // Apply day of week filter if not "all"
    if (dayOfWeekFilter !== "all") {
      upcomingOpportunities = upcomingOpportunities.filter((opp) => {
        // Parse date in local timezone to avoid day shifting
        const oppDate = parseLocalDate(opp.date);
        const dayOfWeek = oppDate.getDay();
        return dayOfWeek === parseInt(dayOfWeekFilter);
      });
    }
    
    // Limit to 5 after filtering
    upcomingOpportunities = upcomingOpportunities.slice(0, 5);

    // Get opportunities the user is signed up for
    const mySignups = opportunities
      .filter((opp) => isSignedUp(opp))
      .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));

    const getSignedUpCount = (opportunity) => {
      return opportunity.signups ? opportunity.signups.length : 0;
    };

    return (
      <div className="w-80 bg-white shadow-sm border-l h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Volunteer Profile Section */}
          {currentView === "volunteer" && currentVolunteer && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
              <div className="flex items-center mb-3">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Welcome, {currentVolunteer.first_name}!
                  </h3>
                  <p className="text-sm text-gray-600">{currentVolunteer.training_mountain}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full mt-3 px-3 py-2 text-sm text-blue-700 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-blue-200 font-medium"
              >
                Sign Out
              </button>
            </div>
          )}

          {/* My Upcoming Shifts */}
          {currentView === "volunteer" && mySignups.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">My Shifts</h3>
                <button
                  onClick={downloadAllShiftsAsICS}
                  className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                  title="Download all shifts as calendar file"
                >
                  <Download size={14} className="mr-1" />
                  Download All
                </button>
              </div>
              <div className="space-y-2">
                {mySignups.map((opportunity) => {
                  const calLinks = generateCalendarLinks(opportunity);
                  return (
                    <div key={opportunity.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-sm text-gray-900">{opportunity.title}</h4>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-600 text-white">
                          ✓ Signed Up
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <Calendar size={12} className="mr-1.5" />
                          {parseLocalDate(opportunity.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div>{opportunity.time} • {opportunity.location}</div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <div className="relative flex-1">
                          <button
                            onClick={() => setOpenCalendarDropdown(
                              openCalendarDropdown === opportunity.id ? null : opportunity.id
                            )}
                            className="w-full px-2 py-1.5 text-xs text-blue-700 bg-white rounded hover:bg-blue-50 transition-colors border border-blue-200 font-medium flex items-center justify-center"
                          >
                            <CalendarPlus size={12} className="mr-1" />
                            Add to Calendar
                            <ChevronDown size={12} className="ml-1" />
                          </button>
                          {openCalendarDropdown === opportunity.id && (
                            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <a
                                href={calLinks.google}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-100"
                                onClick={() => setOpenCalendarDropdown(null)}
                              >
                                📅 Google Calendar
                              </a>
                              <a
                                href={calLinks.apple}
                                download={`${opportunity.title}.ics`}
                                className="block px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-100"
                                onClick={() => setOpenCalendarDropdown(null)}
                              >
                                🍎 Apple Calendar
                              </a>
                              <a
                                href={calLinks.outlook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block px-3 py-2 text-xs hover:bg-gray-50 rounded-b-lg"
                                onClick={() => setOpenCalendarDropdown(null)}
                              >
                                📧 Outlook Calendar
                              </a>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeSignup(opportunity.id)}
                          className="px-2 py-1.5 text-xs text-red-700 bg-white rounded hover:bg-red-50 transition-colors border border-red-200 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Today's Opportunities */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Today's Opportunities</h3>
            {todayOpportunities.length > 0 ? (
              <div className="space-y-2">
                {todayOpportunities.map((opportunity) => {
                  const signedUpCount = getSignedUpCount(opportunity);
                  const userIsSignedUp = isSignedUp(opportunity);
                  const isFull = signedUpCount >= opportunity.max_volunteers;
                  
                  return (
                    <div key={opportunity.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm text-gray-900">{opportunity.title}</h4>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            opportunity.type === "on-snow"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {opportunity.type === "on-snow" ? "On Snow" : "Off Snow"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {opportunity.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>{opportunity.time} • {opportunity.location}</span>
                        <span className="font-medium">
                          {signedUpCount}/{opportunity.max_volunteers} spots
                        </span>
                      </div>
                      {currentView === "volunteer" && (
                        <>
                          {userIsSignedUp ? (
                            <div className="px-2 py-1.5 bg-green-50 text-green-700 text-xs rounded-lg text-center font-medium border border-green-200">
                              ✓ You're signed up!
                            </div>
                          ) : isFull ? (
                            <div className="px-2 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg text-center font-medium">
                              Full
                            </div>
                          ) : (
                            <button
                              onClick={() => quickSignUp(opportunity.id)}
                              className="w-full px-2 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              Sign Up Now
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No opportunities today</p>
            )}
          </div>

          {/* Upcoming Opportunities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Upcoming Opportunities</h3>
              <select
                value={dayOfWeekFilter}
                onChange={(e) => setDayOfWeekFilter(e.target.value)}
                className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Days</option>
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
              </select>
            </div>
            {upcomingOpportunities.length > 0 ? (
              <div className="space-y-2">
                {upcomingOpportunities.map((opportunity) => {
                  const signedUpCount = getSignedUpCount(opportunity);
                  const userIsSignedUp = isSignedUp(opportunity);
                  const isFull = signedUpCount >= opportunity.max_volunteers;
                  
                  return (
                    <div key={opportunity.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm text-gray-900">{opportunity.title}</h4>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            opportunity.type === "on-snow"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {opportunity.type === "on-snow" ? "On Snow" : "Off Snow"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <div className="flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {parseLocalDate(opportunity.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })} • {opportunity.time}
                        </div>
                        <span className="font-medium">
                          {signedUpCount}/{opportunity.max_volunteers}
                        </span>
                      </div>
                      {currentView === "volunteer" && (
                        <>
                          {userIsSignedUp ? (
                            <div className="px-2 py-1.5 bg-green-50 text-green-700 text-xs rounded-lg text-center font-medium border border-green-200">
                              ✓ Signed up
                            </div>
                          ) : isFull ? (
                            <div className="px-2 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg text-center font-medium">
                              Full
                            </div>
                          ) : (
                            <button
                              onClick={() => quickSignUp(opportunity.id)}
                              className="w-full px-2 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              Sign Up
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No upcoming opportunities</p>
            )}
          </div>

          {/* Team Chat Button */}
          {currentView === "volunteer" && (
            <div className="border-t pt-6">
              <button
                onClick={() => {
                  setChatOpen(true);
                  setUnreadCount(0);
                }}
                className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare size={18} className="text-blue-600" />
                  <span className="font-semibold text-blue-900">Team Chat</span>
                </div>
                {unreadCount > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold animate-pulse">
                      {unreadCount}
                    </span>
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Contact Section */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Contact Us</h3>
            <div className="space-y-2 text-sm">
              <a href="tel:778-320-9776" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <Phone size={14} className="mr-2" />
                (778) 320-9776
              </a>
              <a href="mailto:volunteers@freestylevancouver.ca" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <Mail size={14} className="mr-2" />
                volunteers@freestylevancouver.ca
              </a>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentView === "admin" && !isAdminLoggedIn) {
    return (
      <AdminLogin 
        loginData={loginData}
        setLoginData={setLoginData}
        handleAdminLogin={handleAdminLogin}
        setCurrentView={setCurrentView}
      />
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <nav className="h-16 bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 h-full flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="Freestyle Vancouver" className="h-8" />
              <h1 className="text-lg font-bold text-gray-900 hidden sm:block">
                Volunteer Portal
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {currentView === "volunteer" ? (
                <>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Menu size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentView("admin")}
                    className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Settings size={20} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowOpportunityForm(true)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={20} />
                  </button>
                  <button
                    onClick={() => setShowTeamChatForm(true)}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    title="Create Team Chat"
                  >
                    <MessageSquare size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentView("volunteer")}
                    className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Users size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setIsAdminLoggedIn(false);
                      setCurrentView("volunteer");
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile Navigation Tabs */}
        {currentView === "volunteer" && (
          <div className="bg-white border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setMobileView("calendar")}
                className={`flex-1 py-3 text-center font-medium text-sm ${
                  mobileView === "calendar"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setMobileView("chat")}
                className={`flex-1 py-3 text-center font-medium text-sm ${
                  mobileView === "chat"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <MessageSquare size={16} />
                  <span>Chat</span>
                </div>
              </button>
              <button
                onClick={() => setMobileView("day")}
                className={`flex-1 py-3 text-center font-medium text-sm ${
                  mobileView === "day"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
              >
                My Day
              </button>
            </div>
          </div>
        )}

        {/* Mobile Content */}
        <div className={mobileView === "chat" ? "" : "pb-16"}>
          {currentView === "volunteer" ? (
            mobileView === "calendar" ? (
              <MobileCalendarView />
            ) : mobileView === "chat" ? (
              <div className="fixed top-[104px] bottom-16 left-0 right-0 overflow-hidden">
                {currentVolunteer ? (
                  <Chat
                    chatRooms={chatRooms}
                    selectedChatRoom={selectedChatRoom}
                    setSelectedChatRoom={setSelectedChatRoom}
                    messages={messages}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    handleSendMessage={handleSendMessage}
                    handleDeleteMessage={handleDeleteMessage}
                    currentVolunteer={currentVolunteer}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full p-8">
                    <div className="text-center">
                      <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-600">Loading chat...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="p-4 bg-white border-b border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const newDate = new Date(selectedDate);
                          newDate.setDate(newDate.getDate() - 1);
                          setSelectedDate(newDate);
                        }}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                        aria-label="Previous day"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setSelectedDate(new Date())}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => {
                          const newDate = new Date(selectedDate);
                          newDate.setDate(newDate.getDate() + 1);
                          setSelectedDate(newDate);
                        }}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                        aria-label="Next day"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <MobileDayView day={{ date: selectedDate, opportunities: getOpportunitiesForDate(selectedDate) }} />
              </div>
            )
          ) : (
            <div className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      handleMonthChange(newDate);
                    }}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium flex items-center"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => handleMonthChange(new Date())}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      handleMonthChange(newDate);
                    }}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium flex items-center"
                    aria-label="Next month"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="grid grid-cols-7 gap-px bg-gray-200">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                    <div
                      key={day}
                      className="bg-gray-50 p-2 text-center font-semibold text-gray-700 text-xs"
                    >
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, index) => {
                    const isToday = day.date.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={index}
                        className={`bg-white p-1 min-h-[80px] ${
                          !day.isCurrentMonth ? "bg-gray-50" : ""
                        } ${isToday ? "ring-2 ring-blue-500 ring-inset" : ""}`}
                      >
                        <div className={`text-xs font-semibold mb-1 ${
                          !day.isCurrentMonth ? "text-gray-400" : isToday ? "text-blue-600" : "text-gray-900"
                        }`}>
                          {day.date.getDate()}
                        </div>
                        <div className="space-y-0.5">
                          {day.opportunities.slice(0, 3).map((opportunity) => (
                            <div
                              key={opportunity.id}
                              className={`text-xs p-1 rounded truncate ${
                                opportunity.type === "on-snow"
                                  ? "bg-blue-100 text-blue-900"
                                  : "bg-green-100 text-green-900"
                              }`}
                            >
                              {opportunity.time}
                            </div>
                          ))}
                          {day.opportunities.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{day.opportunities.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-transparent z-40"
              onClick={() => setSidebarOpen(false)}
            ></div>
            {/* Sidebar */}
            <div className="fixed right-0 top-0 bottom-0 w-full bg-white shadow-xl z-50 transform transition-transform duration-300">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-bold">Menu</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <CloseIcon size={24} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <Sidebar />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Mobile Navigation Bar */}
        {currentView === "volunteer" && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
            <div className="flex justify-around">
              <button
                onClick={() => setMobileView("calendar")}
                className={`flex flex-col items-center p-2 ${
                  mobileView === "calendar" ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <Calendar size={20} />
                <span className="text-xs mt-1">Calendar</span>
              </button>
              <button
                onClick={() => {
                  setSelectedDate(new Date());
                  setMobileView("day");
                }}
                className={`flex flex-col items-center p-2 ${
                  mobileView === "day" ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <User size={20} />
                <span className="text-xs mt-1">My Day</span>
              </button>
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex flex-col items-center p-2 text-gray-500"
              >
                <Menu size={20} />
                <span className="text-xs mt-1">Menu</span>
              </button>
            </div>
          </div>
        )}

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
  }

  // Desktop layout
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Navigation */}
      <nav className="h-16 bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
                <img src={logo} alt="Freestyle Vancouver" className="h-14 w-25" />
              <h1 className="text-xl font-bold text-gray-900">
                Freestyle Volunteer Portal
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {currentView === "volunteer" ? (
                <>
                  {currentVolunteer && (
                    <span className="text-sm text-gray-600 hidden sm:block">
                      {currentVolunteer.first_name} {currentVolunteer.last_name}
                    </span>
                  )}
                  <button
                    onClick={() => setCurrentView("admin")}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Settings size={20} />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={20} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowOpportunityForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Add Opportunity</span>
                  </button>
                  <button
                    onClick={() => setShowTeamChatForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <MessageSquare size={20} />
                    <span className="hidden sm:inline">Create Team</span>
                  </button>
                  <button
                    onClick={() => setCurrentView("volunteer")}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Users size={20} />
                    <span className="hidden sm:inline">Volunteer View</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAdminLoggedIn(false);
                      setCurrentView("volunteer");
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={20} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content - Calendar */}
        <div className="flex-1 p-4 flex flex-col overflow-hidden">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-3 flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-900">
              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
              >
                Next
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 flex-1 flex flex-col min-h-0">
            <div className="grid grid-cols-7 gap-px bg-gray-200 flex-shrink-0">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="bg-gray-50 p-2 text-center font-semibold text-gray-700 text-sm"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200 flex-1 overflow-auto">
              {calendarDays.map((day, index) => {
                const isToday = day.date.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={index}
                    className={`bg-white p-2 flex flex-col ${
                      !day.isCurrentMonth ? "bg-gray-50" : ""
                    } ${
                      isToday ? "ring-2 ring-blue-500 ring-inset" : ""
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-1 flex-shrink-0 ${
                      !day.isCurrentMonth ? "text-gray-400" : isToday ? "text-blue-600" : "text-gray-900"
                    }`}>
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-1 overflow-y-auto flex-1 min-h-0">
                      {day.opportunities.map((opportunity) => {
                        const signedUpCount = opportunity.signups ? opportunity.signups.length : 0;
                        const userIsSignedUp = isSignedUp(opportunity);
                        const isFull = signedUpCount >= opportunity.max_volunteers;
                        
                        return (
                          <div
                            key={opportunity.id}
                            className={`text-xs p-1.5 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                              opportunity.type === "on-snow"
                                ? "bg-blue-50 text-blue-900 border border-blue-200"
                                : "bg-green-50 text-green-900 border border-green-200"
                            } ${userIsSignedUp ? "ring-2 ring-offset-1 ring-green-500" : ""}`}
                          >
                            <div className="font-semibold">{opportunity.time}</div>
                            <div className="truncate font-medium">{opportunity.title}</div>
                            <div className="text-xs opacity-75">
                              {signedUpCount}/{opportunity.max_volunteers} signed up
                            </div>
                            {currentView === "admin" && (
                              <div className="flex space-x-1 mt-1">
                                <button
                                  onClick={() => setEditingOpportunity(opportunity)}
                                  className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100 rounded"
                                  title="Edit"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => deleteOpportunity(opportunity.id)}
                                  className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded"
                                  title="Delete"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                            {currentView === "volunteer" && (
                              <>
                                {userIsSignedUp ? (
                                  <button
                                    onClick={() => removeSignup(opportunity.id)}
                                    className="w-full mt-1 px-1 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 font-medium"
                                  >
                                    <X size={10} className="inline mr-1" />
                                    Remove
                                  </button>
                                ) : isFull ? (
                                  <div className="w-full mt-1 px-1 py-1 bg-gray-300 text-gray-700 text-xs rounded text-center font-medium">
                                    Full
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => quickSignUp(opportunity.id)}
                                    className="w-full mt-1 px-1 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 font-medium"
                                  >
                                    Sign Up
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Panel - Volunteer List */}
          {currentView === "admin" && (
            <div className="mt-4 bg-white rounded-lg shadow p-4 flex-1 overflow-auto">
              <h3 className="text-lg font-bold mb-3">Volunteer Management</h3>
              {opportunities.map((opportunity) => {
                const signups = opportunity.signups || [];
                return (
                  <div key={opportunity.id} className="mb-4 border-b pb-3">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="font-semibold text-sm">{opportunity.title}</h4>
                        <p className="text-xs text-gray-600">
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
                        Volunteers ({signups.length}/{opportunity.max_volunteers}):
                      </strong>
                      {signups.length > 0 ? (
                        <div className="mt-1 space-y-1">
                          {signups.map((signup) => {
                            const volunteer = signup.volunteer;
                            if (!volunteer) return null;
                            return (
                              <div
                                key={signup.id}
                                className="bg-gray-50 p-2 rounded"
                              >
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <strong>Name:</strong> {volunteer.first_name}{" "}
                                    {volunteer.last_name}
                                  </div>
                                  <div>
                                    <strong>Email:</strong> {volunteer.email}
                                  </div>
                                  <div>
                                    <strong>Phone:</strong> {volunteer.mobile}
                                  </div>
                                  <div>
                                    <strong>Training Mountain:</strong>{" "}
                                    {volunteer.training_mountain}
                                  </div>
                                  <div>
                                    <strong>Signed Up:</strong>{" "}
                                    {new Date(signup.signed_up_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 mt-1">No volunteers signed up yet</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <Sidebar />
        
        {/* Chat Panel - Always visible on desktop */}
        {chatOpen && (
          <div className="w-96 bg-white shadow-lg border-l border-gray-200 flex-shrink-0">
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-blue-50">
                <div className="flex items-center space-x-2">
                  <MessageSquare size={20} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">Team Chat</h2>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <CloseIcon size={20} />
                </button>
              </div>
              
              {/* Chat Component */}
              <div className="flex-1 overflow-hidden">
                <Chat
                  chatRooms={chatRooms}
                  selectedChatRoom={selectedChatRoom}
                  setSelectedChatRoom={setSelectedChatRoom}
                  messages={messages}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                  handleDeleteMessage={handleDeleteMessage}
                  currentVolunteer={currentVolunteer}
                />
              </div>
            </div>
          </div>
        )}
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

      {showTeamChatForm && (
        <TeamChatForm
          onClose={() => setShowTeamChatForm(false)}
          onChatRoomsUpdate={(rooms) => setChatRooms(rooms)}
          onRoomCreated={(room) => {
            setSelectedChatRoom(room);
            setChatOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default Volunteer;
                                