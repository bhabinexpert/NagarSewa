import { registerUser } from "../controllers/Authorization.controllers.js";
import express from 'express';

const router = express.Router();
router.post('/register',registerUser);

export default router;