const mongoose = require('mongoose');
const { Image, User } = require('../models');

const catchAsync = require('../utils/catchAsync');

const createImage = catchAsync(async (req, res) => {
  try {
    const image = new Image(req.body);
    await image.save();
    res.status(201).send(image);
  } catch (err) {
    res.status(400).send(err);
  }
});

const getAllImage = catchAsync(async (req, res) => {
  try {
    const images = await Image.find({
      user_id: req.user._id,
      from: 'txt2img'
    });
    res.send(images);
  } catch (err) {
    res.status(500).send(err);
  }
});

const getSharedImage = catchAsync(async (req, res) => {
  try {
    const mergedImages = await Image.aggregate([
      {
        $match: {
          isPublished: true,
        },
      },
      {
        $addFields: {
          objectIdUserId: {
            $toObjectId: '$user_id',
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'objectIdUserId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: {
          path: '$userInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          url: 1,
          model: 1,
          prompt: 1,
          model_name: 1,
          negative_prompt: 1,
          width: 1,
          height: 1,
          num_inference_steps: 50,
          guidance_scale: 1,
          seed: 1,
          title: 1,
          description: 1,
          created_at: 1,
          star: 1,
          user_name: '$userInfo.name',
          user_picture: '$userInfo.picture',
        },
      },
    ]);
    res.send(mergedImages);
  } catch (err) {
    res.status(500).send(err);
  }
});

const getTopRatedImage = catchAsync(async (req, res) => {
  try {
    const mergedImages = await Image.aggregate([
      {
        $match: {
          isPublished: true,
        },
      },
      {
        $addFields: {
          objectIdUserId: {
            $toObjectId: '$user_id',
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'objectIdUserId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: {
          path: '$userInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          url: 1,
          model: 1,
          prompt: 1,
          model_name: 1,
          negative_prompt: 1,
          width: 1,
          height: 1,
          num_inference_steps: 50,
          guidance_scale: 1,
          seed: 1,
          title: 1,
          description: 1,
          created_at: 1,
          star: 1,
          user_name: '$userInfo.name',
          user_picture: '$userInfo.picture',
        },
      },
      {
        $sort: {
          star: -1,
        },
      },
      {
        $limit: 8,
      },
    ]);
    res.send(mergedImages);
  } catch (err) {
    return res.status(500).send({ message: 'Server error.' });
  }
});

const getImageById = catchAsync(async (req, res) => {
  try {
    const { ObjectId } = mongoose.Types;
    const idToMatch = new ObjectId(req.params.id);

    const mergedImages = await Image.aggregate([
      {
        $match: {
          _id: idToMatch,
        },
      },
      {
        $addFields: {
          objectIdUserId: {
            $toObjectId: '$user_id',
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'objectIdUserId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: {
          path: '$userInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          url: 1,
          model: 1,
          prompt: 1,
          model_name: 1,
          negative_prompt: 1,
          width: 1,
          height: 1,
          num_inference_steps: 50,
          guidance_scale: 1,
          seed: 1,
          title: 1,
          description: 1,
          created_at: 1,
          star: 1,
          user_name: '$userInfo.name',
          user_picture: '$userInfo.picture',
        },
      },
    ]);
    if (!mergedImages) return res.status(404).send();
    res.send(mergedImages);
  } catch (err) {
    res.status(500).send(err);
  }
});

const updateImageById = catchAsync(async (req, res) => {
  try {
    const imageId = req.params.id;
    const updateData = req.body;

    const image = await Image.findByIdAndUpdate(imageId, updateData, { new: true });

    if (!image) {
      res.status(404).send({ message: 'Image not found' });
    }

    res.send(image.toJSON());
  } catch (error) {
    res.status(500).send({ message: 'Sever error' });
  }
});

const setFavorite = catchAsync(async (req, res) => {
  const { userId, imgId, stars } = req.body;
  try {
    const image = await Image.findById(imgId);
    const user = await User.findById(userId);

    if (user.favorite_image.includes(imgId)) {
      user.favorite_image.pull(imgId);
    } else {
      user.favorite_image.push(imgId);
    }
    await user.save();

    image.star = stars;
    await image.save();

    res.status(200).send({ user });
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
});

const deleteImage = catchAsync(async (req, res) => {
  const deleteMap = req.body;
  const deleteIds = Object.keys(req.body).filter((id) => deleteMap[id] === true);

  try {
    await Image.deleteMany({
      _id: {
        $in: deleteIds,
      },
      userId: req.user._id,
    });

    const images = await Image.find({
      userId: req.user._id,
    });

    res.send(images);
  } catch (err) {
    res.status(500).send(err);
  }
});

const deleteById = catchAsync(async (req, res) => {
  try {
    const image = await Image.findByIdAndDelete(req.params.id);
    if (!image) return res.status(404).send();
    res.send(image);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = {
  createImage,
  getAllImage,
  getSharedImage,
  getTopRatedImage,
  getImageById,
  updateImageById,
  setFavorite,
  deleteImage,
  deleteById,
};
