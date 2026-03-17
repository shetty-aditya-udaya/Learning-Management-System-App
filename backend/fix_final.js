require('dotenv').config();
const { query } = require('./src/config/db');

async function fixFinal() {
  try {
    console.log('--- Final Visual & Video Fix ---');

    // 1. Update Subjects Thumbnail/Description
    const subjectUpdates = [
      {
        title: 'Mastering Fullstack Development',
        videoId: 'vO6WpWf1YmQ', // Next.js 14 Full Course
        shortDesc: 'Master Next.js 14, PostgreSQL, and modern web architecture from scratch.'
      },
      {
        title: 'TypeScript Mastery',
        videoId: 'd56mG7DezGs', // TypeScript by Mosh
        shortDesc: 'Unlock the power of static typing to write bug-free JavaScript.'
      },
      {
        title: 'AWS Cloud Practitioner',
        videoId: 'SOTamWNgDKc',
        shortDesc: 'Foundational cloud concepts and indispensable AWS services.'
      }
    ];

    for (const sub of subjectUpdates) {
      const thumbUrl = `https://img.youtube.com/vi/${sub.videoId}/hqdefault.jpg`;
      const res = await query(
        'UPDATE subjects SET thumbnail_url = $1, short_description = $2 WHERE title = $3',
        [thumbUrl, sub.shortDesc, sub.title]
      );
      if (res.rowCount > 0) {
        console.log(`✔ Updated subject: ${sub.title}`);
      } else {
        console.log(`✘ Subject not found: ${sub.title}`);
      }
    }

    // 2. Update Videos (Lesson Playback)
    const videoUpdates = [
      {
        title: 'Next.js Secrets',
        videoUrl: 'https://www.youtube.com/embed/vO6WpWf1YmQ'
      },
      {
        title: 'TypeScript Quick Start',
        videoUrl: 'https://www.youtube.com/embed/d56mG7DezGs'
      }
    ];

    for (const vid of videoUpdates) {
      const res = await query(
        'UPDATE videos SET video_url = $1 WHERE title = $2',
        [vid.videoUrl, vid.title]
      );
      if (res.rowCount > 0) {
        console.log(`✔ Updated video: ${vid.title}`);
      } else {
        console.log(`✘ Video not found: ${vid.title}`);
      }
    }

    console.log('\nFinal fix completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error in final fix:', err);
    process.exit(1);
  }
}

fixFinal();
