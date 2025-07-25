import { createClient } from '@/lib/supabase/client';

interface ContentForm {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  category: string;
  form_schema: any;
  estimated_time?: string;
  phase?: string;
  surgery_types: string[];
  tags: string[];
  created_by: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ContentVideo {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  thumbnail_url?: string;
  duration?: string;
  tags: string[];
  phase?: string;
  surgery_types: string[];
  created_by: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ContentExercise {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  instructions: string;
  body_parts: string[];
  phase?: string;
  surgery_types: string[];
  tags: string[];
  video_url?: string;
  image_urls: string[];
  created_by: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export class ContentService {
  private supabase = createClient();

  /**
   * Get current user's tenant ID
   */
  private async getCurrentTenantId() {
    const { data: currentUser } = await this.supabase.auth.getUser();
    const { data: userData } = await this.supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', currentUser?.user?.id)
      .single();

    if (!userData?.tenant_id) throw new Error('No tenant found');
    return userData.tenant_id;
  }

  // ============== FORMS ==============

  /**
   * Get all forms for the current tenant
   */
  async getForms({
    category = '',
    phase = '',
    surgeryType = '',
    isActive = true
  }: {
    category?: string;
    phase?: string;
    surgeryType?: string;
    isActive?: boolean;
  } = {}) {
    try {
      const tenantId = await this.getCurrentTenantId();

      let query = this.supabase
        .from('content_forms')
        .select('*, created_by_user:profiles!created_by(full_name)')
        .eq('tenant_id', tenantId)
        .eq('is_active', isActive);

      if (category) {
        query = query.eq('category', category);
      }

      if (phase) {
        query = query.eq('phase', phase);
      }

      if (surgeryType) {
        query = query.contains('surgery_types', [surgeryType]);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching forms:', error);
      throw error;
    }
  }

  /**
   * Get a single form by ID
   */
  async getFormById(formId: string) {
    try {
      const { data, error } = await this.supabase
        .from('content_forms')
        .select('*, created_by_user:profiles!created_by(full_name)')
        .eq('id', formId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching form:', error);
      throw error;
    }
  }

  /**
   * Create a new form
   */
  async createForm(formData: Omit<ContentForm, 'id' | 'tenant_id' | 'created_by' | 'created_at' | 'updated_at'>) {
    try {
      const tenantId = await this.getCurrentTenantId();
      const { data: currentUser } = await this.supabase.auth.getUser();

      const { data, error } = await this.supabase
        .from('content_forms')
        .insert({
          ...formData,
          tenant_id: tenantId,
          created_by: currentUser.user!.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating form:', error);
      throw error;
    }
  }

  /**
   * Update a form
   */
  async updateForm(formId: string, updates: Partial<ContentForm>) {
    try {
      const { data, error } = await this.supabase
        .from('content_forms')
        .update(updates)
        .eq('id', formId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating form:', error);
      throw error;
    }
  }

  /**
   * Delete a form (soft delete)
   */
  async deleteForm(formId: string) {
    try {
      const { error } = await this.supabase
        .from('content_forms')
        .update({ is_active: false })
        .eq('id', formId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting form:', error);
      throw error;
    }
  }

  // ============== VIDEOS ==============

  /**
   * Get all videos for the current tenant
   */
  async getVideos({
    category = '',
    phase = '',
    surgeryType = '',
    isActive = true
  }: {
    category?: string;
    phase?: string;
    surgeryType?: string;
    isActive?: boolean;
  } = {}) {
    try {
      const tenantId = await this.getCurrentTenantId();

      let query = this.supabase
        .from('content_videos')
        .select('*, created_by_user:profiles!created_by(full_name)')
        .eq('tenant_id', tenantId)
        .eq('is_active', isActive);

      if (category) {
        query = query.eq('category', category);
      }

      if (phase) {
        query = query.eq('phase', phase);
      }

      if (surgeryType) {
        query = query.contains('surgery_types', [surgeryType]);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  }

  /**
   * Get a single video by ID
   */
  async getVideoById(videoId: string) {
    try {
      const { data, error } = await this.supabase
        .from('content_videos')
        .select('*, created_by_user:profiles!created_by(full_name)')
        .eq('id', videoId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  }

  /**
   * Create a new video
   */
  async createVideo(videoData: Omit<ContentVideo, 'id' | 'tenant_id' | 'created_by' | 'created_at' | 'updated_at'>) {
    try {
      const tenantId = await this.getCurrentTenantId();
      const { data: currentUser } = await this.supabase.auth.getUser();

      const { data, error } = await this.supabase
        .from('content_videos')
        .insert({
          ...videoData,
          tenant_id: tenantId,
          created_by: currentUser.user!.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  }

  /**
   * Update a video
   */
  async updateVideo(videoId: string, updates: Partial<ContentVideo>) {
    try {
      const { data, error } = await this.supabase
        .from('content_videos')
        .update(updates)
        .eq('id', videoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  }

  /**
   * Delete a video (soft delete)
   */
  async deleteVideo(videoId: string) {
    try {
      const { error } = await this.supabase
        .from('content_videos')
        .update({ is_active: false })
        .eq('id', videoId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }

  // ============== EXERCISES ==============

  /**
   * Get all exercises for the current tenant
   */
  async getExercises({
    category = '',
    phase = '',
    surgeryType = '',
    difficulty = '',
    bodyPart = '',
    isActive = true
  }: {
    category?: string;
    phase?: string;
    surgeryType?: string;
    difficulty?: string;
    bodyPart?: string;
    isActive?: boolean;
  } = {}) {
    try {
      const tenantId = await this.getCurrentTenantId();

      let query = this.supabase
        .from('content_exercises')
        .select('*, created_by_user:profiles!created_by(full_name)')
        .eq('tenant_id', tenantId)
        .eq('is_active', isActive);

      if (category) {
        query = query.eq('category', category);
      }

      if (phase) {
        query = query.eq('phase', phase);
      }

      if (surgeryType) {
        query = query.contains('surgery_types', [surgeryType]);
      }

      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      if (bodyPart) {
        query = query.contains('body_parts', [bodyPart]);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  }

  /**
   * Get a single exercise by ID
   */
  async getExerciseById(exerciseId: string) {
    try {
      const { data, error } = await this.supabase
        .from('content_exercises')
        .select('*, created_by_user:profiles!created_by(full_name)')
        .eq('id', exerciseId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching exercise:', error);
      throw error;
    }
  }

  /**
   * Create a new exercise
   */
  async createExercise(exerciseData: Omit<ContentExercise, 'id' | 'tenant_id' | 'created_by' | 'created_at' | 'updated_at'>) {
    try {
      const tenantId = await this.getCurrentTenantId();
      const { data: currentUser } = await this.supabase.auth.getUser();

      const { data, error } = await this.supabase
        .from('content_exercises')
        .insert({
          ...exerciseData,
          tenant_id: tenantId,
          created_by: currentUser.user!.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating exercise:', error);
      throw error;
    }
  }

  /**
   * Update an exercise
   */
  async updateExercise(exerciseId: string, updates: Partial<ContentExercise>) {
    try {
      const { data, error } = await this.supabase
        .from('content_exercises')
        .update(updates)
        .eq('id', exerciseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  }

  /**
   * Delete an exercise (soft delete)
   */
  async deleteExercise(exerciseId: string) {
    try {
      const { error } = await this.supabase
        .from('content_exercises')
        .update({ is_active: false })
        .eq('id', exerciseId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw error;
    }
  }

  // ============== STATISTICS ==============

  /**
   * Get content statistics
   */
  async getContentStats() {
    try {
      const tenantId = await this.getCurrentTenantId();

      const [forms, videos, exercises] = await Promise.all([
        this.supabase
          .from('content_forms')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenantId)
          .eq('is_active', true),
        this.supabase
          .from('content_videos')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenantId)
          .eq('is_active', true),
        this.supabase
          .from('content_exercises')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenantId)
          .eq('is_active', true)
      ]);

      return {
        forms: forms.count || 0,
        videos: videos.count || 0,
        exercises: exercises.count || 0
      };
    } catch (error) {
      console.error('Error fetching content stats:', error);
      throw error;
    }
  }

  // ============== UPLOAD HELPERS ==============

  /**
   * Upload file to Supabase Storage
   */
  async uploadFile(file: File, bucket: string, path: string) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const contentService = new ContentService();