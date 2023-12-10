const Joi = require('joi');

const workspace = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    user_id: Joi.string().required(),
    nodes: Joi.array(),
    viewport: Joi.array(),
  }),
};

const my_workspace = {
  body: Joi.object().keys({
    user_id: Joi.string().required(),
  })
}

module.exports = {
  workspace,
  my_workspace
};
