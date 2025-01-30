import fs from 'fs';
import path from 'path';

// Определяем путь к файлу с уроками
const filePath = path.join(process.cwd(), 'src', 'data', 'lessons.js');

// Функция чтения уроков из файла
const readLessons = () => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonStartIndex = fileContent.indexOf('[');
    const jsonEndIndex = fileContent.lastIndexOf(']') + 1;
    const lessonsJson = fileContent.substring(jsonStartIndex, jsonEndIndex);
    return JSON.parse(lessonsJson);
  } catch (error) {
    console.error('Ошибка при чтении файла уроков:', error);
    throw new Error('Failed to read lessons');
  }
};

// Функция записи уроков в файл
const writeLessons = (lessons) => {
  try {
    const fileContent = `export default ${JSON.stringify(lessons, null, 2)};`;
    fs.writeFileSync(filePath, fileContent, 'utf-8');
  } catch (error) {
    console.error('Ошибка при записи файла уроков:', error);
    throw new Error('Failed to write lessons');
  }
};

// Обработчик GET-запросов
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const className = searchParams.get('class');

    const decodedClassName = decodeURIComponent(className);
    const lessons = readLessons();

    const result = {};
    lessons.forEach((lesson) => {
      const relevantTeachers = lesson.teachers.filter((teacher) =>
        teacher.groups.includes(decodedClassName)
      );

      if (relevantTeachers.length > 0) {
        result[lesson.name] = relevantTeachers.map((teacher) => ({
          full_name: `${teacher.last_name} ${teacher.first_name} ${teacher.middle_name}`,
        }));
      }
    });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error('Ошибка в обработке GET-запроса:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}

// Обработчик POST-запросов
export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.action) {
      return new Response(JSON.stringify({ error: 'Action is required' }), {
        status: 400,
      });
    }

    const lessons = readLessons();

    if (body.action === 'update_teacher') {
      const { lesson, full_name, group } = body;

      if (!lesson || !full_name || !group) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400 }
        );
      }

      const targetLesson = lessons.find((l) => l.name === lesson);
      if (!targetLesson) {
        return new Response(
          JSON.stringify({ error: 'Lesson not found' }),
          { status: 404 }
        );
      }

      const oldTeacherIndex = targetLesson.teachers.findIndex((t) =>
        t.groups.includes(group)
      );
      if (oldTeacherIndex === -1) {
        return new Response(
          JSON.stringify({
            error: 'Teacher for the specified group not found',
          }),
          { status: 404 }
        );
      }

      const oldTeacher = targetLesson.teachers[oldTeacherIndex];
      oldTeacher.groups = oldTeacher.groups.filter((g) => g !== group);

      const [lastName, firstName, middleName] = full_name.split(' ');
      let newTeacher = targetLesson.teachers.find(
        (t) =>
          t.last_name === lastName &&
          t.first_name === firstName &&
          t.middle_name === middleName
      );

      if (!newTeacher) {
        newTeacher = {
          first_name: firstName,
          last_name: lastName,
          middle_name: middleName,
          groups: [],
        };
        targetLesson.teachers.push(newTeacher);
      }

      if (!newTeacher.groups.includes(group)) {
        newTeacher.groups.push(group);
      }

      writeLessons(lessons);
      return new Response(
        JSON.stringify({ message: 'Teacher updated successfully' }),
        { status: 200 }
      );
    }

    if (body.action === 'add_lesson') {
      const { lessonName, teacherName, group } = body;
    
      if (!lessonName || !teacherName || !group) {
        return new Response(
          JSON.stringify({
            error: 'Lesson name, teacher name, and group are required',
          }),
          { status: 400 }
        );
      }
    
      // Ищем урок по имени
      const targetLesson = lessons.find((lesson) => lesson.name === lessonName);
    
      if (!targetLesson) {
        return new Response(
          JSON.stringify({ error: 'Lesson not found. Please create the lesson first.' }),
          { status: 404 }
        );
      }
    
      const [lastName, firstName, middleName] = teacherName.split(' ');
    
      // Ищем учителя в уроке
      let targetTeacher = targetLesson.teachers.find(
        (teacher) =>
          teacher.last_name === lastName &&
          teacher.first_name === firstName &&
          teacher.middle_name === middleName
      );
    
      if (!targetTeacher) {
        // Если учителя нет, создаем нового
        targetTeacher = {
          first_name: firstName,
          last_name: lastName,
          middle_name: middleName,
          groups: [],
        };
        targetLesson.teachers.push(targetTeacher);
      }
    
      // Добавляем класс к учителю, если он еще не добавлен
      if (!targetTeacher.groups.includes(group)) {
        targetTeacher.groups.push(group);
      }
    
      writeLessons(lessons);
    
      return new Response(
        JSON.stringify({ message: 'Teacher added to lesson successfully' }),
        { status: 200 }
      );
    }
    

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400 }
    );
  } catch (error) {
    console.error('Ошибка в обработке POST-запроса:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}
export async function DELETE(req) {
  try {
    const { lessonName, teacherName, group } = await req.json();

    if (!lessonName) {
      return new Response(
        JSON.stringify({ error: 'Lesson name is required' }),
        { status: 400 }
      );
    }

    const lessons = readLessons();
    const targetLessonIndex = lessons.findIndex(
      (lesson) => lesson.name === lessonName
    );

    if (targetLessonIndex === -1) {
      return new Response(
        JSON.stringify({ error: 'Lesson not found' }),
        { status: 404 }
      );
    }

    const targetLesson = lessons[targetLessonIndex];

    // Если указан только урок, удаляем его полностью
    if (!teacherName && !group) {
      lessons.splice(targetLessonIndex, 1);
      writeLessons(lessons);
      return new Response(
        JSON.stringify({ message: 'Lesson deleted successfully' }),
        { status: 200 }
      );
    }

    // Если указан учитель, ищем его
    const targetTeacherIndex = targetLesson.teachers.findIndex(
      (teacher) =>
        `${teacher.last_name} ${teacher.first_name} ${teacher.middle_name}` ===
        teacherName
    );

    if (targetTeacherIndex === -1) {
      return new Response(
        JSON.stringify({ error: 'Teacher not found in the specified lesson' }),
        { status: 404 }
      );
    }

    const targetTeacher = targetLesson.teachers[targetTeacherIndex];

    // Если указана только группа, удаляем ее из учителя
    if (group) {
      const groupIndex = targetTeacher.groups.indexOf(group);

      if (groupIndex === -1) {
        return new Response(
          JSON.stringify({
            error: 'Group not found for the specified teacher',
          }),
          { status: 404 }
        );
      }

      targetTeacher.groups.splice(groupIndex, 1);

      // Если у учителя больше нет групп, удаляем его из урока
      if (targetTeacher.groups.length === 0) {
        targetLesson.teachers.splice(targetTeacherIndex, 1);
      }

      // Если после этого у урока больше нет учителей, удаляем сам урок
      if (targetLesson.teachers.length === 0) {
        lessons.splice(targetLessonIndex, 1);
      }

      writeLessons(lessons);
      return new Response(
        JSON.stringify({ message: 'Group deleted successfully' }),
        { status: 200 }
      );
    }

    // Если учитель указан без группы, удаляем его полностью
    targetLesson.teachers.splice(targetTeacherIndex, 1);

    // Если после удаления учителя урок пуст, удаляем сам урок
    if (targetLesson.teachers.length === 0) {
      lessons.splice(targetLessonIndex, 1);
    }

    writeLessons(lessons);
    return new Response(
      JSON.stringify({ message: 'Teacher deleted successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка в обработке DELETE-запроса:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}