import fs from 'fs';
import path from 'path';

const studentsFile = path.join(process.cwd(), 'src', 'data', 'students.json');

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const className = searchParams.get('className');

  try {
    const fileData = fs.readFileSync(studentsFile, 'utf8');
    const students = JSON.parse(fileData);

    const filteredStudents = students.filter(
      student => `${student.class_id}${student.group}` === className
    );

    return new Response(JSON.stringify(filteredStudents), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Ошибка чтения данных о студентах' }),
      { status: 500 }
    );
  }
}
