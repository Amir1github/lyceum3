import { NextResponse } from 'next/server';
import { supabaseHelpers } from '../../../../lib/supabase';

// Обработчик GET-запроса
export async function GET() {
  try {
    const workhourData = await supabaseHelpers.getWorkHours();
    return NextResponse.json(workhourData);
  } catch (error) {
    console.error('Error fetching work hours:', error);
    return NextResponse.json({ error: 'Не удалось загрузить расписание.' }, { status: 500 });
  }
}

// Note: POST operation for work hours would require updating multiple records in Supabase.
// For now, keeping GET only. This would need proper batch update operations.
