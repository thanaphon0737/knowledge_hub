import { Router } from 'express';
import { register } from '../controllers/AuthController';

const router = Router();

// เมื่อมี request แบบ POST มาที่ /register ให้เรียกใช้ฟังก์ชัน register
router.post('/register', register);

// เมื่อมี request แบบ POST มาที่ /login ให้เรียกใช้ฟังก์ชัน login
// router.post('/login', login);

export default router;