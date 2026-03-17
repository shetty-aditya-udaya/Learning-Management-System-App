require('dotenv').config();
const { query } = require('./src/config/db');

async function run() {
  try {
    console.log('--- Final Data Fix ---');
    
    // 1. Get Instructor ID
    const userRes = await query("SELECT id FROM users WHERE email = 'verify@success.com'");
    if (userRes.rows.length === 0) throw new Error('Instructor not found');
    const instructorId = userRes.rows[0].id;

    // 2. Ensure instructor name
    await query("UPDATE users SET name = 'Aditya Shetty' WHERE id = $1", [instructorId]);

    // 3. Link ALL courses to instructor and add metadata
    const goals = 'Master React and Next.js, Build scalable Express backends, Integration with PostgreSQL, State management and Auth best practices';
    const shortDesc = 'Learn to build complete, production-ready fullstack applications from scratch using the latest web technologies.';
    
    await query(`
      UPDATE subjects 
      SET 
        instructor_id = $1, 
        learning_goals = $2, 
        short_description = $3
    `, [instructorId, goals, shortDesc]);
    console.log('✔ Metadata updated for all subjects');

    // 4. Ensure at least 3 videos for the main course
    const subject = await query("SELECT id FROM subjects WHERE title = 'Mastering Fullstack Development'");
    if (subject.rows.length > 0) {
      const subjectId = subject.rows[0].id;
      
      // Get a section for this subject
      let section = await query('SELECT id FROM sections WHERE subject_id = $1 LIMIT 1', [subjectId]);
      if (section.rows.length === 0) {
        // Create a section if none exists
        const newSec = await query('INSERT INTO sections (subject_id, title, order_index) VALUES ($1, $2, $3) RETURNING id', [subjectId, 'Core Fundamentals', 1]);
        section = { rows: [newSec.rows[0]] };
      }
      const sectionId = section.rows[0].id;

      // Delete existing videos and re-insert to be sure
      await query('DELETE FROM videos WHERE section_id = $1', [sectionId]);
      
      const videos = [
        ['React Fundamentals', 'https://www.youtube.com/embed/SqcY0GlETPk', 120, 1],
        ['Next.js Secrets', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 180, 2],
        ['PostgreSQL Mastery', 'https://www.youtube.com/embed/8P0h9H6Q5Fw', 240, 3]
      ];

      for (const [title, url, dur, ord] of videos) {
        await query('INSERT INTO videos (section_id, title, video_url, duration_seconds, order_index) VALUES ($1, $2, $3, $4, $5)', [sectionId, title, url, dur, ord]);
      }
      console.log('✔ Re-seeded 3 lessons for the course');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during final fix:', err);
    process.exit(1);
  }
}

run();
