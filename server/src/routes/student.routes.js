import { Router } from 'express';
import { getDashboard, scanQR, faceVerify, getAttendanceHistory } from '../controllers/student.controller.js';
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/rbac.js';

const router = Router();

router.use(authenticate, authorize('STUDENT'));

router.get('/dashboard', getDashboard);
router.post('/scan-qr', scanQR);
router.post('/face-verify', faceVerify);
router.get('/history', getAttendanceHistory);

export default router;
