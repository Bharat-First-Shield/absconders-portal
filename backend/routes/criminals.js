import express from 'express';
import {
  getCriminals,
  getCriminal,
  createCriminal,
  updateCriminal,
  deleteCriminal,
  searchCriminals
} from '../controllers/criminals.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCriminals)
  .post(authorize('admin', 'investigator'), createCriminal);

router.get('/search', searchCriminals);

router.route('/:id')
  .get(getCriminal)
  .put(authorize('admin', 'investigator'), updateCriminal)
  .delete(authorize('admin'), deleteCriminal);

export default router;