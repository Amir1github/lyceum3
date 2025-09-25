import { supabaseHelpers } from '../../../../lib/supabase';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const className = searchParams.get('className');

  try {
    const students = await supabaseHelpers.getStudents();

    const filteredStudents = students.filter(
      student => `${student.class_id}${student.group}` === className
    );

    return new Response(JSON.stringify(filteredStudents), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return new Response(
      JSON.stringify({ message: 'Ошибка чтения данных о студентах' }),
      { status: 500 }
    );
  }
}

// Note: POST and DELETE operations for students would require
// updating the JSONB student_data field in Supabase.
// For now, keeping GET only to maintain data integrity.
// These operations would need proper JSON manipulation within Supabase.
