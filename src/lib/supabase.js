import { createClient } from '@supabase/supabase-js'

// Use environment variables for security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for volunteer management
export const volunteerService = {
  // Get current volunteer profile
  async getCurrentVolunteer() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      return null
    }

    return data
  },

  // Update volunteer profile
  async updateVolunteer(updates) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('volunteers')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get all volunteers (admin only)
  async getAllVolunteers() {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Update volunteer status (admin only)
  async updateVolunteerStatus(volunteerId, status) {
    const { data, error } = await supabase
      .from('volunteers')
      .update({ status })
      .eq('id', volunteerId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Authentication helpers
export const authService = {
  // Sign in
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Reset password
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }
}

// Opportunity management helpers
export const opportunityService = {
  // Get all opportunities
  async getAllOpportunities() {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('date', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get opportunities for a specific date
  async getOpportunitiesByDate(date) {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('date', date)
      .order('time', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Create new opportunity
  async createOpportunity(opportunityData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('You must be logged in to create opportunities');
      }
      
      const { data, error } = await supabase
        .from('opportunities')
        .insert([{
          ...opportunityData,
          created_by: user.id
        }])
        .select()
        .single()

      if (error) {
        throw error;
      }
      
      return data
    } catch (err) {
      throw err;
    }
  },

  // Update opportunity
  async updateOpportunity(id, updates) {
    const { data, error } = await supabase
      .from('opportunities')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete opportunity
  async deleteOpportunity(id) {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Get opportunities with signup information (date-filtered for performance)
  async getOpportunitiesWithSignups(startDate = null, endDate = null) {
    // Default to current month ± 2 months if no dates provided
    if (!startDate) {
      const today = new Date();
      startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    }
    if (!endDate) {
      const today = new Date();
      endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);
    }

    const startDateStr = startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate;
    const endDateStr = endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate;

    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        signups (
          id,
          signed_up_at,
          volunteer:volunteers (
            id,
            user_id,
            first_name,
            last_name,
            email,
            mobile,
            training_mountain
          )
        )
      `)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get all opportunities (for admin - with pagination)
  async getAllOpportunitiesWithSignups(page = 1, pageSize = 50) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('opportunities')
      .select(`
        *,
        signups (
          id,
          signed_up_at,
          volunteer:volunteers (
            id,
            user_id,
            first_name,
            last_name,
            email,
            mobile,
            training_mountain
          )
        )
      `, { count: 'exact' })
      .order('date', { ascending: false })
      .range(from, to)

    if (error) throw error
    return { data: data || [], total: count || 0, page, pageSize }
  }
}

// Signup management helpers
export const signupService = {
  // Sign up for an opportunity
  async signUpForOpportunity(opportunityId) {
    // First get the current user's volunteer profile
    const volunteer = await volunteerService.getCurrentVolunteer()
    if (!volunteer) throw new Error('Volunteer profile not found')

    // Check if already signed up
    const { data: existingSignup } = await supabase
      .from('signups')
      .select('id')
      .eq('opportunity_id', opportunityId)
      .eq('volunteer_id', volunteer.id)
      .single()

    if (existingSignup) {
      throw new Error('Already signed up for this opportunity')
    }

    // Check if opportunity is full
    const { data: opportunity } = await supabase
      .from('opportunities')
      .select('max_volunteers, signups(id)')
      .eq('id', opportunityId)
      .single()

    if (opportunity && opportunity.signups.length >= opportunity.max_volunteers) {
      throw new Error('This opportunity is already full')
    }

    // Create signup
    const { data, error } = await supabase
      .from('signups')
      .insert([{
        opportunity_id: opportunityId,
        volunteer_id: volunteer.id
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Remove signup
  async removeSignup(opportunityId) {
    const volunteer = await volunteerService.getCurrentVolunteer()
    if (!volunteer) throw new Error('Volunteer profile not found')

    const { error } = await supabase
      .from('signups')
      .delete()
      .eq('opportunity_id', opportunityId)
      .eq('volunteer_id', volunteer.id)

    if (error) throw error
  },

  // Check if user is signed up
  async isSignedUp(opportunityId) {
    const volunteer = await volunteerService.getCurrentVolunteer()
    if (!volunteer) return false

    const { data, error } = await supabase
      .from('signups')
      .select('id')
      .eq('opportunity_id', opportunityId)
      .eq('volunteer_id', volunteer.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  },

  // Get all signups for a volunteer
  async getMySignups() {
    const volunteer = await volunteerService.getCurrentVolunteer()
    if (!volunteer) return []

    const { data, error } = await supabase
      .from('signups')
      .select(`
        id,
        signed_up_at,
        opportunity:opportunities (*)
      `)
      .eq('volunteer_id', volunteer.id)
      .order('signed_up_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}

// Chat management helpers
export const chatService = {
  // Get all chat rooms for current user
  async getUserChatRooms() {
    const volunteer = await volunteerService.getCurrentVolunteer()
    if (!volunteer) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('chat_room_members')
      .select(`
        chat_room_id,
        role,
        chat_rooms (
          id,
          name,
          type,
          description,
          created_at
        )
      `)
      .eq('volunteer_id', volunteer.id)

    if (error) throw error
    return data?.map(item => ({ ...item.chat_rooms, user_role: item.role })) || []
  },

  // Get messages for a chat room
  async getChatMessages(chatRoomId, limit = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        sender:sender_id (
          id,
          first_name,
          last_name
        )
      `)
      .eq('chat_room_id', chatRoomId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data?.reverse() || []
  },

  // Send a message
  async sendMessage(chatRoomId, content) {
    const volunteer = await volunteerService.getCurrentVolunteer()
    if (!volunteer) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_room_id: chatRoomId,
        sender_id: volunteer.id,
        content: content.trim()
      })
      .select(`
        id,
        content,
        created_at,
        sender:sender_id (
          id,
          first_name,
          last_name
        )
      `)
      .single()

    if (error) throw error
    return data
  },

  // Subscribe to new messages in a chat room
  subscribeToMessages(chatRoomId, callback) {
    return supabase
      .channel(`messages:${chatRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${chatRoomId}`
        },
        async (payload) => {
          // Fetch the full message with sender details
          const { data } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              created_at,
              sender:sender_id (
                id,
                first_name,
                last_name
              )
            `)
            .eq('id', payload.new.id)
            .single()
          
          if (data) callback(data)
        }
      )
      .subscribe()
  },

  // Create a new team chat room (admin only)
  async createTeamChatRoom(name, description, volunteerIds) {
    // Create the room
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .insert({
        name,
        type: 'team',
        description
      })
      .select()
      .single()

    if (roomError) throw roomError

    // Add members
    const members = volunteerIds.map(volunteerId => ({
      chat_room_id: room.id,
      volunteer_id: volunteerId,
      role: 'member'
    }))

    const { error: membersError } = await supabase
      .from('chat_room_members')
      .insert(members)

    if (membersError) throw membersError

    return room
  },

  // Get members of a chat room
  async getChatRoomMembers(chatRoomId) {
    const { data, error } = await supabase
      .from('chat_room_members')
      .select(`
        role,
        volunteer:volunteer_id (
          id,
          first_name,
          last_name
        )
      `)
      .eq('chat_room_id', chatRoomId)

    if (error) throw error
    return data || []
  },

  // Delete a message (only your own)
  async deleteMessage(messageId) {
    const volunteer = await volunteerService.getCurrentVolunteer()
    if (!volunteer) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', volunteer.id) // Can only delete own messages

    if (error) throw error
  }
}