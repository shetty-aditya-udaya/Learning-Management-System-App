require('dotenv').config();
const { query } = require('./src/config/db');

async function fixPostgreSQLAndNextJS() {
  try {
    console.log('--- Final Robust Video & Thumbnail Fix ---');

    // 1. Get/Create Instructor IDs
    const getInstructor = async (name, email) => {
      const res = await query("SELECT id FROM users WHERE name = $1", [name]);
      if (res.rows.length > 0) return res.rows[0].id;
      const ins = await query(
        "INSERT INTO users (email, name, role, password_hash) VALUES ($1, $2, 'instructor', 'external') RETURNING id",
        [email, name]
      );
      return ins.rows[0].id;
    };

    const traversyId = await getInstructor('Traversy Media', 'brad@traversy.com');
    const amigoscodeId = await getInstructor('Amigoscode', 'nelson@amigoscode.com');

    // 2. Define Fixes
    // Next.js: Traversy Media (mTz0GXj8NN0)
    // PostgreSQL: Amigoscode (-LqzU8YRSRE)
    const fixes = [
      {
        courseTitle: 'Mastering Fullstack Development',
        lessonTitle: 'Next.js Secrets',
        videoId: 'mTz0GXj8NN0',
        instructorId: traversyId,
        newLessonTitle: 'Next.js App Router Crash Course'
      },
      {
        courseTitle: 'Mastering Fullstack Development',
        lessonTitle: 'PostgreSQL Mastery',
        videoId: '-LqzU8YRSRE', // Use the 40 min one if it's better, or 2h one
        instructorId: traversyId, // Keeping it simple under one instructor for the main course if preferred, but let's use the actual author
        newLessonTitle: 'PostgreSQL Crash Course'
      }
    ];

    // Update Subjects
    // Mastering Fullstack Development - Using Traversy as main instructor
    const nextjsThumb = `https://i.ytimg.com/vi/mTz0GXj8NN0/hqdefault.jpg`;
    await query(
      "UPDATE subjects SET thumbnail_url = $1, instructor_id = $2, short_description = $3 WHERE title = 'Mastering Fullstack Development'",
      [nextjsThumb, traversyId, 'Master Next.js, PostgreSQL, and modern web architecture with Traversy Media.']
    );

    // Update TypeScript Mastery thumbnail (fixing the grey box)
    const tsVideoId = 'd56mG7DezGs'; // Mosh TS
    const tsThumb = `https://i.ytimg.com/vi/${tsVideoId}/hqdefault.jpg`;
    await query(
      "UPDATE subjects SET thumbnail_url = $1 WHERE title = 'TypeScript Mastery'",
      [tsThumb]
    );

    // Update Lessons
    for (const fix of fixes) {
      const videoUrl = `https://www.youtube.com/embed/${fix.videoId}`;
      const res = await query(
        "UPDATE videos SET video_url = $1, title = $2 WHERE title = $3",
        [videoUrl, fix.newLessonTitle, fix.lessonTitle]
      );
      if (res.rowCount > 0) {
        console.log(`✔ Updated lesson: ${fix.lessonTitle} -> ${fix.newLessonTitle}`);
      } else {
        // Try fuzzy match or check if already updated
        const check = await query("SELECT id FROM videos WHERE title = $1", [fix.newLessonTitle]);
        if (check.rows.length > 0) {
          await query("UPDATE videos SET video_url = $1 WHERE title = $2", [videoUrl, fix.newLessonTitle]);
          console.log(`✔ Verified lesson: ${fix.newLessonTitle}`);
        } else {
          console.log(`✘ Lesson not found: ${fix.lessonTitle}`);
        }
      }
    }

    // Specially fix PostgreSQL Mastery if it was named differently
    const pgVideoId = 'atL90pce_nQ'; // Amigoscode
    const pgUrl = `https://www.youtube.com/embed/${pgVideoId}`;
    await query(
      "UPDATE videos SET video_url = $1 WHERE title LIKE '%PostgreSQL%'",
      [pgUrl]
    );
    console.log('✔ Forced update for PostgreSQL related videos');

    console.log('\nFix successfully applied.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error executing fix:', err);
    process.exit(1);
  }
}

fixPostgreSQLAndNextJS();
