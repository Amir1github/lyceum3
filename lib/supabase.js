import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zsvdqzefetzfdfaqgunb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdmRxemVmZXR6ZmRmYXFndW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3OTk3NDksImV4cCI6MjA3NDM3NTc0OX0.3AJ6iMJmhKLDGhN7BMPDrXGCtJ_nFMGw8b3pZ1eZz4M';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const supabaseHelpers = {
  // Gallery operations
  async getGallery() {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    return data[0] || { images: [] };
  },

  async addGalleryImages(images) {
    const { data, error } = await supabase
      .from('gallery')
      .select('images')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    const currentImages = data[0]?.images || [];
    const updatedImages = [...currentImages, ...images];

    const { data: result, error: updateError } = await supabase
      .from('gallery')
      .upsert([{ images: updatedImages }])
      .select();

    if (updateError) throw updateError;
    return result;
  },
  async updateGalleryImages(images) {
    console.log("updateGalleryImages working");
    const { error } = await supabase
      .from('gallery')
      .update({ images });
    if (error) return { error };
    return { success: true };
  },
  async removeGalleryImage(imageUrl) {
    console.log("removeGalleryImage working");
  
    // 1. Получаем текущий массив изображений
    const { data, error: fetchError } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
  
    if (fetchError) return { error: fetchError };
    if (!data) return { error: 'Запись галереи не найдена' };
  
    // 2. Фильтруем массив, убираем нужную ссылку
    const updatedImages = data.images.filter(url => url !== imageUrl);
  
    // 3. Если массив пустой — удаляем запись целиком
    if (updatedImages.length === 0) {
      const { error: deleteError } = await supabase
        .from('gallery')
        .delete()
        .eq('id', data.id);
  
      if (deleteError) return { error: deleteError };
    } else {
      // Иначе обновляем запись с оставшимися изображениями
      const { error: updateError } = await supabase
        .from('gallery')
        .update({ images: updatedImages })
        .eq('id', data.id);
  
      if (updateError) return { error: updateError };
    }
  
    return { success: true };
  },
  
  
  

  // News operations
  async getNews() {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getNewsById(id) {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async addNews(newsItem) {
    const { data, error } = await supabase
      .from('news')
      .insert([newsItem])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async deleteNews(id) {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Cabinets operations
  async getCabinetByTeacher(teacherName) {
    const { data, error } = await supabase
      .from('cabinets')
      .select(`
        cabinet_number,
        cabinet_types(name),
        capacity,
        pavilions(pavilion_number),
        staff(responsible_person)
      `)
      .ilike('staff.responsible_person', `%${teacherName}%`);

    if (error) throw error;
    return data[0];
  },

  async updateCabinetByTeacher(teacherName, cabinetNumber) {
    // First, find the staff member
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('id')
      .ilike('responsible_person', `%${teacherName}%`);

    if (staffError) throw staffError;

    if (!staffData || staffData.length === 0) {
      // Create new staff member and cabinet
      const { data: newStaff, error: newStaffError } = await supabase
        .from('staff')
        .insert([{ staff_id: Date.now(), responsible_person: teacherName }])
        .select();

      if (newStaffError) throw newStaffError;

      const { data: newCabinet, error: newCabinetError } = await supabase
        .from('cabinets')
        .insert([{
          staff_id: newStaff[0].id,
          cabinet_number: cabinetNumber,
          cabinet_type_id: null,
          capacity: 30,
          pavilion_id: null
        }])
        .select();

      if (newCabinetError) throw newCabinetError;
      return newCabinet[0];
    }

    // Update existing cabinet
    const { data, error } = await supabase
      .from('cabinets')
      .update({ cabinet_number: cabinetNumber })
      .eq('staff_id', staffData[0].id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Messages operations
  async getMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async addMessage(message) {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async deleteMessage(name, email, message) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('name', name)
      .eq('email', email)
      .eq('message', message);
    
    if (error) throw error;
    return true;
  },

  async clearAllMessages() {
    const { error } = await supabase
      .from('messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (error) throw error;
    return true;
  },

  // Vacancies operations
  async getVacancies() {
    const { data, error } = await supabase
      .from('vacancies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addVacancy(vacancy) {
    const { data, error } = await supabase
      .from('vacancies')
      .insert([vacancy])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async deleteVacancy(id) {
    const { error } = await supabase
      .from('vacancies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Contact info operations
  async getContactInfo() {
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    return data[0] || {};
  },

  async updateContactInfo(contactInfo) {
    const { data, error } = await supabase
      .from('contact_info')
      .upsert([contactInfo])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Work hours operations
  async getWorkHours() {
    const { data, error } = await supabase
      .from('work_hours')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Class list operations
  async getClassList() {
    const { data, error } = await supabase
      .from('class_groups')
      .select(`
        *,
        classes(*)
      `)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Transform data to match original structure
    return {
      groups: data.map(group => ({
        groupName: group.group_name,
        classes: group.classes.map(cls => ({
          name: cls.name,
          letters: cls.letters
        }))
      }))
    };
  },

  // Students operations
  async getStudents() {
    const { data, error } = await supabase
      .from('students')
      .select('student_data')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    return data[0]?.student_data || [];
  }
};
