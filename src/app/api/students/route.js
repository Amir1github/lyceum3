import fs from 'fs';
import path from 'path';

const studentsFile = path.join(process.cwd(), 'public', 'data', 'students.json');

function readStudentsData() {
  const fileData = fs.readFileSync(studentsFile, 'utf8');
  return JSON.parse(fileData);
}

function writeStudentsData(data) {
  fs.writeFileSync(studentsFile, JSON.stringify(data, null, 2));
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const className = searchParams.get('className');

  try {
    const students = readStudentsData();

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

export async function POST(req) {
  try {
    const body = await req.json();
    const { className, firstName, lastName, birthDate, gender } = body;

    if (!className || !firstName || !lastName || !birthDate || !gender) {
      return new Response(JSON.stringify({ error: 'Все поля обязательны' }), {
        status: 400,
      });
    }

    const students = readStudentsData();

    const newStudent = {
      student_id: `${className}_${Date.now()}`, // Генерация уникального ID
      class_id: className.slice(0, -1),
      group: className.slice(-1),
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate,
      gender: gender === 'male',
    };

    students.push(newStudent);
    writeStudentsData(students);

    return new Response(JSON.stringify(newStudent), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Ошибка добавления ученика' }), {
      status: 500,
    });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { className, lastName } = body;

    if (!className || !lastName) {
      return new Response(JSON.stringify({ error: 'Класс и фамилия обязательны' }), {
        status: 400,
      });
    }

    let students = readStudentsData();

    const initialLength = students.length;
    students = students.filter(
      student => !(
        student.class_id + student.group === className &&
        student.last_name === lastName
      )
    );

    if (students.length === initialLength) {
      return new Response(
        JSON.stringify({ error: 'Ученик не найден' }),
        { status: 404 }
      );
    }

    writeStudentsData(students);

    return new Response(JSON.stringify({ message: 'Ученик удален' }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Ошибка удаления ученика' }), {
      status: 500,
    });
  }
}
