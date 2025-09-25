import { NextResponse } from "next/server";
import { supabaseHelpers } from "../../../../lib/supabase";

export async function GET() {
  try {
    const classData = await supabaseHelpers.getClassList();
    return NextResponse.json(classData);
  } catch (error) {
    console.error('Error fetching class list:', error);
    return NextResponse.json({ error: 'Failed to fetch class list' }, { status: 500 });
  }
}

// Note: POST and DELETE operations for class management would require
// more complex Supabase operations. For now, keeping GET only.
// These operations would need to be implemented with proper database transactions
// to maintain referential integrity between class_groups and classes tables.
