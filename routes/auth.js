import express from 'express';
import { login } from '../services/authService.js';

const router = express.Router();

router.post('/login', login);

export default router;