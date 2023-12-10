const Joi = require('joi');
// const { password, objectId } = require('./custom.validation');

const txt2img = {
  body: Joi.object().keys({
    params: Joi.object().keys({
      modelId: Joi.string().required(),
      model: Joi.string().required(),
      model_name: Joi.string().required(),
      modelType: Joi.string().required(),
      vae: Joi.string().required(),
      prompt: Joi.string().required(),
      negative_prompt: Joi.string().allow(''),
      width: Joi.number().required(),
      height: Joi.number().required(),
      num_outputs: Joi.number().required(),
      steps: Joi.number().required(),
      guidance_scale: Joi.number().required(),
      seed: Joi.number().required(),
      sampler: Joi.string().required(),
    }),
    userId: Joi.string().required(),
    credit: Joi.number().required(),
    from: Joi.string().required(),
  }),
};

module.exports = {
  txt2img,
};
