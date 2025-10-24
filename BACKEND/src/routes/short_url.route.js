import express from 'express';
import { createShortUrl, toggleStatus, deleteUrlController, updateExpiryController } from '../controller/short_url.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = express.Router();

router.post("/",createShortUrl);
router.put("/status/:id", authMiddleware, toggleStatus);
router.delete("/:id", authMiddleware, deleteUrlController);
router.put("/expiry/:id", authMiddleware, updateExpiryController);

export default router;
