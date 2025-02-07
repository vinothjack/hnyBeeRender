import express from 'express';
import {
  createProduct,
  getProductsWithImages,
  updateProduct,
  deleteProduct,
  getProductById,
  getProductsByCategory,
  getOfferImage,
  createOfferImage,
  deleteOfferImage,
} from '../controllers/productController.mjs';
import { authenticate } from '../middleware/authMiddleware.mjs';

const router = express.Router();

// Offer image routes
router.get('/offerImage', getOfferImage);
router.post('/offerImage', authenticate, createOfferImage);
router.delete('/offerImage/:id', authenticate, deleteOfferImage);

// Product routes
router.post('/', authenticate, createProduct);
router.get('/', authenticate, getProductsWithImages);
router.get('/:id', authenticate, getProductById);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);
router.get('/category/:productCategoryId', getProductsByCategory);




export default router;