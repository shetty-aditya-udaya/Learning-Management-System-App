require('dotenv').config();
const { query } = require('./src/config/db');

async function fixAll() {
  try {
    console.log('--- Database Fix Script ---');
    
    // 1. Add column name to users
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)');
    console.log('✔ Column "name" ensured on users');

    // 2. Add columns to subjects
    await query('ALTER TABLE subjects ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES users(id)');
    await query('ALTER TABLE subjects ADD COLUMN IF NOT EXISTS learning_goals TEXT');
    await query('ALTER TABLE subjects ADD COLUMN IF NOT EXISTS short_description VARCHAR(500)');
    console.log('✔ Columns ensured on subjects');

    // 3. Update test user name
    const email = 'verify@success.com';
    await query("UPDATE users SET name = 'Aditya Shetty' WHERE email = $1", [email]);
    console.log('✔ Instructor name set');

    // 4. Get instructor id
    const userRes = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) throw new Error('Test user not found');
    const instructorId = userRes.rows[0].id;

    // 5. Update subjects metadata
    const goals = 'Master React and Next.js, Build scalable Express backends, Integration with PostgreSQL, State management and Auth best practices';
    const shortDesc = 'Learn to build complete, production-ready fullstack applications from scratch using the latest web technologies.';
    
    await query(`
      UPDATE subjects 
      SET 
        instructor_id = $1, 
        learning_goals = $2, 
        short_description = $3
      WHERE title = 'Mastering Fullstack Development'
    `, [instructorId, goals, shortDesc]);
    console.log('✔ Course metadata and linkage updated');

    // 6. Test the final query used by the service
    const result = await query(`
      SELECT 
        s.*, 
        COALESCE(u.name, u.email) as instructor_name, 
        COUNT(v.id)::int as total_lessons, 
        COALESCE(SUM(v.duration_seconds), 0)::int as total_duration
      FROM subjects s
      LEFT JOIN users u ON s.instructor_id = u.id
      LEFT JOIN sections sec ON s.id = sec.subject_id
      LEFT JOIN videos v ON sec.id = v.section_id
      GROUP BY s.id, u.id
    `);
    
    console.log('✔ Test Query Result:');
    console.log(JSON.stringify(result.rows, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('❌ Fix failed:', err);
    process.exit(1);
  }
}

fixAll();
