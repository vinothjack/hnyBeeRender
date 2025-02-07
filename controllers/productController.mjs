import Product from '../models/productModel.mjs';
import OfferImg from '../models/offerModel.mjs';
import { returnResponse } from '../utils/response.mjs';
import { bucket } from '../utils/firebase.mjs';
import mongoose from 'mongoose';

export const createProduct = async (req, res) => {
  const { productName, oldPrice, offerPrice, categories, productCategoryId, productImage } = req.body;


  if (!productName || !oldPrice || !offerPrice || !categories || !productCategoryId || !productImage) {
    return returnResponse(res, 400, 'All fields are required');
  }

  try {
    const product = new Product({
      productName,
      oldPrice,
      offerPrice,
      productDetails: { categories, productCategoryId },
      productImage, // Store the image URL directly
    });

    await product.save();
    return returnResponse(res, 201, 'Product created successfully', product);
  } catch (error) {
    console.error('Error creating product:', error);
    return returnResponse(res, 500, 'Failed to create product');
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;


  if (!mongoose.Types.ObjectId.isValid(id)) {
    return returnResponse(res, 400, "Invalid product ID");
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return returnResponse(res, 404, "Product not found");
    }

    const { productName, oldPrice, offerPrice, productImage, productDetails } = req.body;

    const oldProductImage = product.productImage; // Current image URL in the database
    const newProductImage = productImage; // New image URL from the payload

    const updateData = {};

    if (productName) updateData.productName = productName;
    if (oldPrice !== undefined && oldPrice !== '') updateData.oldPrice = Number(oldPrice);
    if (offerPrice !== undefined && offerPrice !== '') updateData.offerPrice = Number(offerPrice);

    if (newProductImage === null) {
      updateData.productImage = null; // Remove image
      if (oldProductImage) {
        await deleteImageFromFirebase(oldProductImage); // Delete old image from Firebase
      }
    } else if (newProductImage && newProductImage !== oldProductImage) {
      if (oldProductImage) {
        await deleteImageFromFirebase(oldProductImage); // Delete old image from Firebase
      }
      updateData.productImage = newProductImage; // Update with new image URL
    }

    if (productDetails) {
      if (productDetails.productCategoryId) updateData['productDetails.categories'] = productDetails.categories;
      if (productDetails.productCategoryId) updateData['productDetails.productCategoryId'] = productDetails.productCategoryId;
    }

    

    const updatedProduct = await Product.findByIdAndUpdate(id, { $set: updateData }, { new: true });

    return returnResponse(res, 200, "Product updated successfully", updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return returnResponse(res, 500, "Failed to update product");
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const { image } = req.body;

  // Validate product ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return returnResponse(res, 400, 'Invalid product ID');
  }

  try {

    // Delete the image from Firebase Storage if imageUrl is provided
    if (image) {
      try {
        await deleteImageFromFirebase(image);
        console.log(`Deleted image from Firebase: ${image}`);
      } catch (firebaseError) {
        console.error('Error deleting image from Firebase:', firebaseError);
        // Log the error but continue with the response
      }
    }
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return returnResponse(res, 404, 'Product not found');
    }

    return returnResponse(res, 200, 'Product deleted successfully');
  } catch (error) {
    console.error('Error deleting product:', error);
    return returnResponse(res, 500, 'Failed to delete product');
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return returnResponse(res, 400, 'Invalid product ID');
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return returnResponse(res, 404, 'Product not found');
    }
    return returnResponse(res, 200, product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return returnResponse(res, 500, 'Failed to fetch product');
  }
};

export const getProductsWithImages = async (req, res) => {
  try {
    const products = await Product.find();
    const productsWithImages = products.map((product) => ({
      id: product.id,
      productName: product.productName,
      oldPrice: product.oldPrice,
      offerPrice: product.offerPrice,
      categories: product.productDetails.categories,
      productCategoryId: product.productDetails.productCategoryId,
      image: product.productImage, // Return the image URL directly
    }));

    return returnResponse(res, 200, productsWithImages);
  } catch (error) {
    console.error('Error fetching products:', error);
    return returnResponse(res, 500, 'Failed to fetch products');
  }
};

export const getProductsByCategory = async (req, res) => {
  const { productCategoryId } = req.params;

  try {
    const products = await Product.find({
      'productDetails.productCategoryId': productCategoryId,
    });

    if (products.length === 0) {
      return returnResponse(res, 404, 'No products found for this category');
    }

    const productsWithImages = products.map((product) => ({
      id: product.id,
      productName: product.productName,
      oldPrice: product.oldPrice,
      offerPrice: product.offerPrice,
      categories: product.productDetails.categories,
      productCategoryId: product.productDetails.productCategoryId,
      image: product.productImage, // Return the image URL directly
    }));

    return returnResponse(res, 200, productsWithImages);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return returnResponse(res, 500, 'Failed to fetch products');
  }
};

export const getOfferImage = async (req, res) => {
  try {
    const offerImages = await OfferImg.find();
    const offerImagesWithUrls = offerImages.map((offer) => ({
      id: offer.id,
      image: offer.imageUrl, // Return the image URL directly
    }));

    return returnResponse(res, 200, offerImagesWithUrls);
  } catch (error) {
    console.error('Error fetching offer images:', error);
    return returnResponse(res, 500, 'Failed to fetch offer images');
  }
};

export const createOfferImage = async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return returnResponse(res, 400, 'Image URL is required');
  }

  try {
    const newOfferImage = new OfferImg({ imageUrl });
    await newOfferImage.save();
    return returnResponse(res, 201, 'Offer image created successfully', newOfferImage);
  } catch (error) {
    console.error('Error creating offer image:', error);
    return returnResponse(res, 500, 'Failed to create offer image');
  }
};

export const deleteOfferImage = async (req, res) => {
  const { id } = req.params;
  const {imageUrl} = req.body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return returnResponse(res, 400, "Invalid offer image ID");
  }

  try {

     // Delete the image from Firebase Storage if imageUrl is provided
     if (imageUrl) {
      try {
        await deleteImageFromFirebase(imageUrl);
      } catch (firebaseError) {
        console.error('Error deleting image from Firebase:', firebaseError);
        // Log the error but continue with the response
      }
    }
    const offerImage = await OfferImg.findById(id);
    if (!offerImage) {
      return returnResponse(res, 404, "Offer image not found");
    }

    await OfferImg.findByIdAndDelete(id);

    return returnResponse(res, 200, "Offer image deleted successfully");
  } catch (error) {
    console.error("Error deleting offer image:", error);
    return returnResponse(res, 500, "Failed to delete offer image");
  }
};

const deleteImageFromFirebase = async (imageUrl) => {
  try {
    if (!imageUrl) {
      console.log("No image URL provided for deletion.");
      return;
    }

    const urlParts = imageUrl.split("/o/");
    if (urlParts.length < 2) {
      console.log("Invalid image URL format:", imageUrl);
      return;
    }

    const filePath = decodeURIComponent(urlParts[1].split("?")[0]);
    const file = bucket.file(filePath);

    await file.delete();
  } catch (error) {
    console.error("Error deleting image from Firebase:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};