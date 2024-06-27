import express from 'express';
import { getExamples, createExample } from '../../controllers/exampleController.js';

const router = express.Router();

router.get('/', getExamples);
router.post('/', createExample);

export default router;
