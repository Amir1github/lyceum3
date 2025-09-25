import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

console.log('🚀 Запуск миграции недостающих таблиц...');

// Supabase configuration
const supabaseUrl = 'https://zsvdqzefetzfdfaqgunb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdmRxemVmZXR6ZmRmYXFndW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3OTk3NDksImV4cCI6MjA3NDM3NTc0OX0.3AJ6iMJmhKLDGhN7BMPDrXGCtJ_nFMGw8b3pZ1eZz4M';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to read JSON files
function readJsonFile(filename) {
  const filePath = path.join(process.cwd(), 'public', 'data', filename);
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    return null;
  }
}

// Migrate Messages
async function migrateMessages() {
  console.log('\n📧 Миграция сообщений...');
  const messagesData = readJsonFile('messages.json');
  if (!messagesData) return false;

  try {
    const messagesToInsert = messagesData.map(message => ({
      name: message.name,
      email: message.email,
      message: message.message,
      admin: message.admin || false,
      created_at: message.timestamp
    }));

    const { data, error } = await supabase
      .from('messages')
      .insert(messagesToInsert);

    if (error) {
      console.error('Error migrating messages:', error);
      return false;
    }

    console.log(`✅ Мигрировано ${messagesData.length} сообщений`);
    return true;
  } catch (error) {
    console.error('Error migrating messages:', error);
    return false;
  }
}

// Migrate Work Hours
async function migrateWorkHours() {
  console.log('\n⏰ Миграция рабочих часов...');
  const workHoursData = readJsonFile('workhour.json');
  if (!workHoursData) return false;

  try {
    const { data, error } = await supabase
      .from('work_hours')
      .insert(workHoursData);

    if (error) {
      console.error('Error migrating work hours:', error);
      return false;
    }

    console.log(`✅ Мигрировано ${workHoursData.length} записей рабочих часов`);
    return true;
  } catch (error) {
    console.error('Error migrating work hours:', error);
    return false;
  }
}

// Migrate Students
async function migrateStudents() {
  console.log('\n👥 Миграция студентов...');
  const studentsData = readJsonFile('students.json');
  if (!studentsData) return false;

  try {
    const { data, error } = await supabase
      .from('students')
      .insert([{ student_data: studentsData }]);

    if (error) {
      console.error('Error migrating students:', error);
      return false;
    }

    console.log(`✅ Мигрированы данные студентов (${studentsData.length} записей)`);
    return true;
  } catch (error) {
    console.error('Error migrating students:', error);
    return false;
  }
}

// Migrate Vacancies
async function migrateVacancies() {
  console.log('\n💼 Миграция вакансий...');
  const vacanciesData = readJsonFile('vacancies.json');
  if (!vacanciesData) return false;

  try {
    const vacanciesToInsert = vacanciesData.map(vacancy => ({
      position: vacancy.position,
      salary: vacancy.salary,
      hours_per_week: vacancy.hoursPerWeek,
      description: vacancy.description,
      requirements: vacancy.requirements
    }));

    const { data, error } = await supabase
      .from('vacancies')
      .insert(vacanciesToInsert);

    if (error) {
      console.error('Error migrating vacancies:', error);
      return false;
    }

    console.log(`✅ Мигрировано ${vacanciesData.length} вакансий`);
    return true;
  } catch (error) {
    console.error('Error migrating vacancies:', error);
    return false;
  }
}

// Migrate Class Groups and Classes
async function migrateClassList() {
  console.log('\n📚 Миграция списка классов...');
  const classListData = readJsonFile('classlist.json');
  if (!classListData) return false;

  try {
    for (const group of classListData.groups) {
      // Insert class group
      const { data: groupData, error: groupError } = await supabase
        .from('class_groups')
        .insert([{ group_name: group.groupName }])
        .select();

      if (groupError) {
        console.error('Error inserting class group:', groupError);
        continue;
      }

      const groupId = groupData[0].id;

      // Insert classes for this group
      const classesToInsert = group.classes.map(cls => ({
        group_id: groupId,
        name: cls.name,
        letters: cls.letters
      }));

      const { error: classesError } = await supabase
        .from('classes')
        .insert(classesToInsert);

      if (classesError) {
        console.error('Error inserting classes:', classesError);
      }
    }

    console.log('✅ Мигрированы группы классов и классы');
    return true;
  } catch (error) {
    console.error('Error migrating class list:', error);
    return false;
  }
}

// Migrate Cabinets, Staff, Cabinet Types, and Pavilions
async function migrateCabinets() {
  console.log('\n🏢 Миграция кабинетов и преподавателей...');
  const cabinetsData = readJsonFile('cabinets.json');
  if (!cabinetsData) return false;

  try {
    // Get unique cabinet types and pavilion numbers
    const cabinetTypes = [...new Set(cabinetsData.map(c => c.cabinetType))];
    const pavilionNumbers = [...new Set(cabinetsData.map(c => c.pavilionNumber))];

    // Insert cabinet types
    const cabinetTypesToInsert = cabinetTypes.map(type => ({ name: type }));
    const { data: insertedCabinetTypes, error: cabinetTypesError } = await supabase
      .from('cabinet_types')
      .insert(cabinetTypesToInsert)
      .select();

    if (cabinetTypesError) {
      console.error('Error inserting cabinet types:', cabinetTypesError);
      return false;
    }

    // Create mapping for cabinet types
    const cabinetTypeMap = {};
    insertedCabinetTypes.forEach(type => {
      cabinetTypeMap[type.name] = type.id;
    });

    // Insert pavilions
    const pavilionsToInsert = pavilionNumbers.map(number => ({ pavilion_number: number }));
    const { data: insertedPavilions, error: pavilionsError } = await supabase
      .from('pavilions')
      .insert(pavilionsToInsert)
      .select();

    if (pavilionsError) {
      console.error('Error inserting pavilions:', pavilionsError);
      return false;
    }

    // Create mapping for pavilions
    const pavilionMap = {};
    insertedPavilions.forEach(pavilion => {
      pavilionMap[pavilion.pavilion_number] = pavilion.id;
    });

    // Insert staff and cabinets
    for (const cabinet of cabinetsData) {
      // Insert staff if not exists
      const { data: existingStaff } = await supabase
        .from('staff')
        .select('id')
        .eq('staff_id', cabinet.staffId)
        .single();

      let staffId;
      if (existingStaff) {
        staffId = existingStaff.id;
      } else {
        const { data: newStaff, error: staffError } = await supabase
          .from('staff')
          .insert([{ 
            staff_id: cabinet.staffId, 
            responsible_person: cabinet.responsiblePerson 
          }])
          .select();

        if (staffError) {
          console.error('Error inserting staff:', staffError);
          continue;
        }
        staffId = newStaff[0].id;
      }

      // Insert cabinet
      const { error: cabinetError } = await supabase
        .from('cabinets')
        .insert([{
          staff_id: staffId,
          cabinet_number: cabinet.cabinetNumber,
          cabinet_type_id: cabinetTypeMap[cabinet.cabinetType],
          capacity: cabinet.capacity,
          pavilion_id: pavilionMap[cabinet.pavilionNumber]
        }]);

      if (cabinetError) {
        console.error('Error inserting cabinet:', cabinetError);
      }
    }

    console.log('✅ Мигрированы кабинеты, преподаватели, типы кабинетов и павильоны');
    return true;
  } catch (error) {
    console.error('Error migrating cabinets:', error);
    return false;
  }
}

// Main migration function
async function runMigration() {
  console.log('🎯 Начинаем миграцию недостающих таблиц...');
  
  const results = [];
  
  try {
    // Migrate all missing tables
    results.push({ name: 'Messages', success: await migrateMessages() });
    results.push({ name: 'Work Hours', success: await migrateWorkHours() });
    results.push({ name: 'Students', success: await migrateStudents() });
    results.push({ name: 'Vacancies', success: await migrateVacancies() });
    results.push({ name: 'Class Groups & Classes', success: await migrateClassList() });
    results.push({ name: 'Cabinets & Staff', success: await migrateCabinets() });
    
    // Results
    console.log('\n📊 === РЕЗУЛЬТАТЫ МИГРАЦИИ ===');
    results.forEach(result => {
      console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
    });
    
    const successful = results.filter(r => r.success).length;
    console.log(`\n🎯 Успешно мигрировано: ${successful}/${results.length} таблиц`);
    
    if (successful === results.length) {
      console.log('🎉 Все таблицы успешно мигрированы!');
    } else {
      console.log('⚠️  Некоторые таблицы не удалось мигрировать. Проверьте ошибки выше.');
    }
    
  } catch (error) {
    console.error('💥 Критическая ошибка миграции:', error);
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('🏁 Миграция завершена');
  })
  .catch(err => {
    console.error('💥 Критическая ошибка:', err);
  });
