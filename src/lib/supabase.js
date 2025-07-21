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