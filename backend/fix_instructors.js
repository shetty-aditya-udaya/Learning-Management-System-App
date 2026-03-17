require('dotenv').config();
const { query } = require('./src/config/db');

async function fixInstructors() {
  try {
    console.log('--- Correcting Instructor Names ---');

    const instructors = [
      { name: 'Programming with Mosh', email: 'mosh@youtube.com' },
      { name: 'JavaScript Mastery', email: 'jsm@youtube.com' },
      { name: 'The Net Ninja', email: 'netninja@youtube.com' },
      { name: 'TechWorld with Nana', email: 'nana@youtube.com' },
      { name: 'Andrew Brown (ExamPro)', email: 'andrew@exampro.co' },
      { name: 'Codevolution', email: 'codevolution@youtube.com' }
    ];

    const instructorMap = {};

    for (const inst of instructors) {
      const existing = await query('SELECT id FROM users WHERE email = $1', [inst.email]);
      let userId;
      if (existing.rows.length > 0) {
        userId = existing.rows[0].id;
        await query('UPDATE users SET name = $1, role = $2 WHERE id = $3', [inst.name, 'instructor', userId]);
      } else {
        const res = await query(
          "INSERT INTO users (email, name, role, password_hash) VALUES ($1, $2, $3, 'external_instructor') RETURNING id",
          [inst.email, inst.name, 'instructor']
        );
        userId = res.rows[0].id;
      }
      instructorMap[inst.name] = userId;
      console.log(`✔ Prepared instructor: ${inst.name}`);
    }

    const updates = [
      { course: 'Python for Beginners', author: 'Programming with Mosh' },
      { course: 'React Native for Mobile', author: 'JavaScript Mastery' },
      { course: 'TypeScript Mastery', author: 'The Net Ninja' },
      { course: 'Docker Essentials', author: 'Programming with Mosh' },
      { course: 'AWS Cloud Practitioner', author: 'Andrew Brown (ExamPro)' },
      { course: 'Mastering Fullstack Development', author: 'Codevolution' }
    ];

    for (const update of updates) {
      const instId = instructorMap[update.author];
      const res = await query(
        "UPDATE subjects SET instructor_id = $1 WHERE title = $2 RETURNING id",
        [instId, update.course]
      );
      if (res.rowCount > 0) {
        console.log(`✔ Linked "${update.course}" to ${update.author}`);
      } else {
        console.log(`✘ Course not found: ${update.course}`);
      }
    }

    console.log('\nInstructor corrections complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during instructor fix:', err);
    process.exit(1);
  }
}

fixInstructors();
