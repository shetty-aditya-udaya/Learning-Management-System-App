require('dotenv').config();
const { query } = require('./src/config/db');

async function fixVideosFinal() {
  try {
    console.log('--- Permanent Video Fix Execution ---');

    // 1. Get Instructor ID for Lama Dev
    const instRes = await query("SELECT id FROM users WHERE name = 'Lama Dev'");
    let lamaDevId;
    if (instRes.rows.length > 0) {
      lamaDevId = instRes.rows[0].id;
    } else {
      const newInst = await query(
        "INSERT INTO users (email, name, role, password_hash) VALUES ('lama@youtube.com', 'Lama Dev', 'instructor', 'external') RETURNING id"
      );
      lamaDevId = newInst.rows[0].id;
    }

    // 2. Update Mastering Fullstack Development metadata
    const nextjsId = '843nec-IvW0';
    const thumbUrl = `https://img.youtube.com/vi/${nextjsId}/hqdefault.jpg`;
    
    await query(
      "UPDATE subjects SET thumbnail_url = $1, instructor_id = $2 WHERE title = 'Mastering Fullstack Development'",
      [thumbUrl, lamaDevId]
    );
    console.log('✔ Updated Mastering Fullstack Development metadata');

    // 3. Update specific lessons
    const videoFixes = [
      { title: 'Next.js Secrets', url: 'https://www.youtube.com/embed/843nec-IvW0' },
      { title: 'PostgreSQL Mastery', url: 'https://www.youtube.com/embed/qw--VwXG71w' }
    ];

    for (const fix of videoFixes) {
      const res = await query(
        "UPDATE videos SET video_url = $1 WHERE title = $2",
        [fix.url, fix.title]
      );
      if (res.rowCount > 0) {
        console.log(`✔ Updated video playback: ${fix.title}`);
      } else {
        console.log(`✘ Video not found: ${fix.title}`);
      }
    }

    console.log('\nFix successfully applied.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error executing fix:', err);
    process.exit(1);
  }
}

fixVideosFinal();
