require('dotenv').config();
const { query } = require('./src/config/db');

async function updateVisuals() {
  try {
    console.log('--- Updating Thumbnails, Descriptions & Learning Goals ---');

    // 1. Alter table to add columns
    console.log('Step 1: Updating database schema...');
    await query(`
      ALTER TABLE subjects 
      ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
      ADD COLUMN IF NOT EXISTS short_description TEXT,
      ADD COLUMN IF NOT EXISTS learning_goals TEXT
    `);
    console.log('✔ Schema updated');

    // 2. Define comprehensive course metadata
    const metadata = [
      {
        title: 'Mastering Fullstack Development',
        videoId: 'W9nZ66S_V78',
        shortDesc: 'Master Next.js, PostgreSQL, and modern web architecture from scratch.',
        goals: 'Next.js 14, PostgreSQL, Prisma ORM, Authentication, Deployment'
      },
      {
        title: 'Python for Beginners',
        videoId: 'kqtD5dpn9C8',
        shortDesc: 'Learn Python syntax, logic, and building your first applications.',
        goals: 'Python Fundamentals, Data Types, Control Flow, Functions, Scripting'
      },
      {
        title: 'React Native for Mobile',
        videoId: '0-S5a0eXPoc',
        shortDesc: 'Create native iOS and Android apps using React skills.',
        goals: 'Expo Router, Native Components, Shared Logic, Mobile UX, Publishing'
      },
      {
        title: 'TypeScript Mastery',
        videoId: 'gieEQFIfgYw',
        shortDesc: 'Unlock the power of static typing to write bug-free JavaScript.',
        goals: 'Type Basics, Interfaces, Generics, TS with React, Best Practices'
      },
      {
        title: 'Docker Essentials',
        videoId: 'pTFZFxd4hOI',
        shortDesc: 'Deploy and scale applications efficiently using containers.',
        goals: 'Images & Containers, Docker Compose, Networking, Volumes, CI/CD'
      },
      {
        title: 'AWS Cloud Practitioner',
        videoId: 'SOTamWNgDKc',
        shortDesc: 'Foundational cloud concepts and indispensable AWS services.',
        goals: 'Cloud Economics, IAM, S3 & EC2, VPC, Exam Readiness'
      }
    ];

    // 3. Update subjects
    for (const meta of metadata) {
      // Use hqdefault for maximum reliability
      const thumbUrl = `https://img.youtube.com/vi/${meta.videoId}/hqdefault.jpg`;
      const res = await query(
        `UPDATE subjects 
         SET thumbnail_url = $1, short_description = $2, learning_goals = $3 
         WHERE title = $2 OR title = $4 
         RETURNING id`,
        [thumbUrl, meta.shortDesc, meta.goals, meta.title]
      );
      
      // Fixed the previous query which might have used wrong indexing
      const finalRes = await query(
        `UPDATE subjects 
         SET thumbnail_url = $1, short_description = $2, learning_goals = $3 
         WHERE title = $4`,
        [thumbUrl, meta.shortDesc, meta.goals, meta.title]
      );

      console.log(`✔ Updated: ${meta.title}`);
    }

    console.log('\nVisual updates complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating visuals:', err);
    process.exit(1);
  }
}

updateVisuals();
