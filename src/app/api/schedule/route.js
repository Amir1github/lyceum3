import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import scheduleData from '@/data/subjects'; // Import the existing scheduleData from the JS file

const filePath = path.join(process.cwd(), 'src', 'data', 'subjects.js'); // Path to `subjects.js`

// Function to write updates back to `subjects.js`
function saveScheduleData(data) {
  const fileContent = `const scheduleData = ${JSON.stringify(data, null, 2)};\n\nexport default scheduleData;`;
  fs.writeFileSync(filePath, fileContent, 'utf8');
}

// GET method to fetch the schedule
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const className = searchParams.get('class');
  const dayOfWeek = searchParams.get('day');

  // Validate required parameters
  if (!className || !dayOfWeek) {
    return NextResponse.json(
      { error: 'Missing class or day parameters' },
      { status: 400 }
    );
  }

  const normalizedDayOfWeek = dayOfWeek.trim().charAt(0).toUpperCase() + dayOfWeek.trim().slice(1).toLowerCase();
  const normalizedClassName = className.trim();

  // Find the day data
  const dayData = scheduleData.find((day) => day.weekday === normalizedDayOfWeek);
  if (!dayData) {
    return NextResponse.json({ subjects: [] }, { status: 200 });
  }

  // Find the class data
  const classData = dayData.data.find(
    (entry) => entry.group.replace(/\s+/g, '') === normalizedClassName.replace(/\s+/g, '')
  );

  if (!classData) {
    return NextResponse.json({ subjects: [] }, { status: 200 });
  }

  // Return the subjects for the specified class and day
  return NextResponse.json({ subjects: classData.subjects });
}

// POST method to update the schedule
export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Request Body:', body); // Log the request body for debugging

    const { className, day, schedule } = body;
    if (!className || !day || !Array.isArray(schedule)) {
      return NextResponse.json(
        { error: 'Invalid request data: className, dayOfWeek, and schedule are required.', received: body },
        { status: 400 }
      );
    }
    console.log('ClassName:', className, 'DayOfWeek:', day, 'Schedule:', schedule);

    
    const normalizedDayOfWeek = day.trim().charAt(0).toUpperCase() + day.trim().slice(1).toLowerCase();
    const normalizedClassName = className.trim();

    const updatedSubjects = schedule.map((lesson) => lesson.name).filter((name) => name.trim() !== '');

    let dayData = scheduleData.find((day) => day.weekday === normalizedDayOfWeek);
    if (!dayData) {
      dayData = { weekday: normalizedDayOfWeek, data: [] };
      scheduleData.push(dayData);
    }

    let classData = dayData.data.find(
      (entry) => entry.group.replace(/\s+/g, '') === normalizedClassName.replace(/\s+/g, '')
    );

    if (!classData) {
      classData = { group: normalizedClassName, subjects: [] };
      dayData.data.push(classData);
    }

    classData.subjects = updatedSubjects;

    saveScheduleData(scheduleData);

    return NextResponse.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
