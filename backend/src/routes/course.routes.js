const express = require('express');
const CourseController = require('../controllers/course.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const router = express.Router();

// Student & Public Routes
router.get('/', CourseController.getCourses);
router.get('/:courseId', authMiddleware, CourseController.getCourseById); // Use auth to check enrollment status
router.get('/:courseId/lessons', authMiddleware, CourseController.getCourseLessons);
router.post('/:courseId/enroll', authMiddleware, CourseController.enroll);
router.get('/:courseId/tree', authMiddleware, CourseController.getCourseTree);
router.get('/:courseId/lesson/:lessonId', authMiddleware, CourseController.getVideo);

// Instructor Routes
router.post('/', authMiddleware, checkRole(['instructor', 'admin']), CourseController.createCourse);
router.put('/:id', authMiddleware, checkRole(['instructor', 'admin']), CourseController.updateCourse);
router.delete('/:id', authMiddleware, checkRole(['instructor', 'admin']), CourseController.deleteCourse);
router.post('/:courseId/sections', authMiddleware, checkRole(['instructor', 'admin']), CourseController.addSection);
router.post('/sections/:sectionId/videos', authMiddleware, checkRole(['instructor', 'admin']), CourseController.addVideo);

module.exports = router;
