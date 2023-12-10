const axios = require('axios');
const fs = require('fs');
const entities = require('entities');
const { Storage } = require('@google-cloud/storage');
const uuid = require('uuid');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const { Image } = require('../models');
const { userService } = require('../services');

const storage = new Storage({
  keyFilename: `imagineo-392415-a8047fc2494c.json`,
});

const bucket = storage.bucket(config.GCP_BUCKET_NAME);
// const bucket = storage.bucket(config.GCP_BUCKET_NAME).setCorsConfiguration([
//   {
//     maxAgeSeconds: 3600,
//     method: 'GET',
//     origin: '*',
//     responseHeader: 'Content-Type',
//   },
// ]);

const txt2img = catchAsync(async (req, res) => {
  const { params, userId, credit, from } = req.body;

  const data = {
    prompt: entities.decodeHTML(params.prompt),
    restore_faces: true,
    negative_prompt: params.negative_prompt,
    seed: params.seed,
    override_settings: {
      sd_model_checkpoint: params.model,
      sd_vae: params.vae,
    },
    width: params.width,
    height: params.height,
    guidance_scale: params.guidance_scale,
    cfg_scale: params.guidance_scale,
    sampler_index: params.sampler,
    steps: params.steps,
    email: 'test@example.com',
  };

  axios
    .post(`${config.StableDiffusionAPI}/sdapi/v1/txt2img`, data, {
      headers: {
        'content-type': 'application/json',
      },
    })
    .then(async (response) => {
      try {
        const imageData = response.data.images[0];
        if (!imageData) {
          throw new Error('No image data found in response.');
        }

        const info = JSON.parse(response.data.info);

        await fs.promises.writeFile('output.jpg', imageData, 'base64');

        const folderName = 'generated';
        const imgName = `img-${uuid.v4()}.jpg`;

        await bucket.upload('output.jpg', {
          destination: `${folderName}/${imgName}`,
        });

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${folderName}/${imgName}`;
        const image = new Image({
          url: publicUrl,
          from: from,
          model: params.model,
          model_name: params.model_name,
          prompt: info.prompt,
          negative_prompt: info.negative_prompt,
          width: info.width,
          height: info.height,
          steps: info.steps,
          sampler_name: info.sampler_name,
          guidance_scale: info.cfg_scale,
          user_id: userId,
          seed: info.seed,
        });

        await image.save();
        const user = await userService.updateCredit(userId, credit);
        res.send({ image, user, imageData });
      } catch (err) {
        console.error('Error processing image and saving to bucket:', err.message);
        res.status(500).send({ error: 'Internal server error.' });
      }
    })
    .catch((error) => {
      res.status(500).send({ error });
    });
});

module.exports = {
  txt2img,
};
