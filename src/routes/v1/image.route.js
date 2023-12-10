const express = require('express');

const router = express.Router();
const imageController = require('../../controllers/image.controller');
const auth = require('../../middlewares/auth');

router
  .route('/')
  .post(auth(), imageController.createImage)
  .get(auth(), imageController.getAllImage)
  .delete(auth(), imageController.deleteImage);

router.get('/shared', imageController.getSharedImage);
router.get('/top_rate', imageController.getTopRatedImage);
router.patch('/favorite', auth(), imageController.setFavorite);

router
  .route('/:id')
  .get(imageController.getImageById)
  .patch(auth(), imageController.updateImageById)
  .delete(auth(), imageController.deleteById);

module.exports = router;
