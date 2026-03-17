require('dotenv').config();
const { query } = require('./src/config/db');

async function seed() {
  try {
    console.log('--- Seeding Expanded Catalog & Fixing Videos ---');

    // 1. Get Instructor ID
    const userRes = await query("SELECT id FROM users WHERE email = 'verify@success.com'");
    if (userRes.rows.length === 0) throw new Error('Instructor not found');
    const instructorId = userRes.rows[0].id;

    // 2. Fix Existing Course Videos ("Mastering Fullstack Development")
    console.log('Step 2: Fixing existing videos...');
    await query(
      "UPDATE videos SET video_url = $1, duration_seconds = $2 WHERE title = $3",
      ['https://www.youtube.com/embed/W9nZ66S_V78', 1200, 'Next.js Secrets']
    );
    await query(
      "UPDATE videos SET video_url = $1, duration_seconds = $2 WHERE title = $3",
      ['https://www.youtube.com/embed/HXV3zeQKqGY', 1500, 'PostgreSQL Mastery']
    );
    console.log('✔ Fixed Next.js and PostgreSQL videos');

    // 3. Add 5 New Courses
    const newCourses = [
      {
        title: 'Python for Beginners',
        description: 'The fastest way to learn Python for web development, data science, and AI.',
        sections: [
          {
            title: 'Getting Started',
            videos: [
              ['Python Crash Course', 'https://www.youtube.com/embed/kqtD5dpn9C8', 3600]
            ]
          }
        ]
      },
      {
        title: 'React Native for Mobile',
        description: 'Build native iOS and Android apps using your React skills.',
        sections: [
          {
            title: 'Mobile Architecture',
            videos: [
              ['React Native in 3 Hours', 'https://www.youtube.com/embed/0-S5a0eXPoc', 10800]
            ]
          }
        ]
      },
      {
        title: 'TypeScript Mastery',
        description: 'Write safer, more maintainable code with TypeScript fundamentals.',
        sections: [
          {
            title: 'Type Essentials',
            videos: [
              ['TypeScript Quick Start', 'https://www.youtube.com/embed/gieEQFIfgYw', 2400]
            ]
          }
        ]
      },
      {
        title: 'Docker Essentials',
        description: 'Understand containerization and how to deploy apps seamlessly with Docker.',
        sections: [
          {
            title: 'Containers 101',
            videos: [
              ['Docker Crash Course', 'https://www.youtube.com/embed/pTFZFxd4hOI', 3000]
            ]
          }
        ]
      },
      {
        title: 'AWS Cloud Practitioner',
        description: 'A complete guide to foundational AWS services and cloud computing.',
        sections: [
          {
            title: 'Cloud Fundamentals',
            videos: [
              ['AWS Training for Beginners', 'https://www.youtube.com/embed/SOTamWNgDKc', 7200]
            ]
          }
        ]
      }
    ];

    for (const courseData of newCourses) {
      // Check if course already exists to avoid duplication
      const existing = await query('SELECT id FROM subjects WHERE title = $1', [courseData.title]);
      let subjectId;
      if (existing.rows.length > 0) {
        subjectId = existing.rows[0].id;
        console.log(`Course "${courseData.title}" already exists, skipping...`);
        continue;
      }

      const subjectRes = await query(
        'INSERT INTO subjects (title, description, instructor_id) VALUES ($1, $2, $3) RETURNING id',
        [courseData.title, courseData.description, instructorId]
      );
      subjectId = subjectRes.rows[0].id;

      for (let i = 0; i < courseData.sections.length; i++) {
        const sec = courseData.sections[i];
        const sectionRes = await query(
          'INSERT INTO sections (subject_id, title, order_index) VALUES ($1, $2, $3) RETURNING id',
          [subjectId, sec.title, i + 1]
        );
        const sectionId = sectionRes.rows[0].id;

        for (let j = 0; j < sec.videos.length; j++) {
          const [vTitle, vUrl, vDur] = sec.videos[j];
          await query(
            'INSERT INTO videos (section_id, title, video_url, duration_seconds, order_index) VALUES ($1, $2, $3, $4, $5)',
            [sectionId, vTitle, vUrl, vDur, j + 1]
          );
        }
      }
      console.log(`✔ Added course: ${courseData.title}`);
    }

    console.log('\nAll updates and new courses seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seed();
