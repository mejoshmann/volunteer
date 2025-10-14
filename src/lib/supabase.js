import { createClient } from '@supabase/supabase-js'


const supabaseUrl = 'https://hntwqnuabmhvxtxenunt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudHdxbnVhYm1odnh0eGVudW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODg0NDUsImV4cCI6MjA2Nzk2NDQ0NX0.4iLB6EsDFBvImx2CmsLd9ic8nqILPI8g6Zh5ct40e1g'



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
      console.error('Error fetching volunteer:', error)
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
      
      console.log('Creating opportunity:', opportunityData);
      console.log('Current user:', user);
      
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
        console.error('Supabase error:', error);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw error;
      }
      
      console.log('Successfully created opportunity:', data);
      return data
    } catch (err) {
      console.error('Exception in createOpportunity:', err);
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

  // Get opportunities with signup information
  async getOpportunitiesWithSignups() {
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
      .order('date', { ascending: true })

    if (error) throw error
    return data || []
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