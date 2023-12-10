const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');
const { env } = require('process');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    CLOUDINARY_CLOUD_NAME: Joi.string(),
    CLOUDINARY_API_KEY: Joi.string(),
    CLOUDINARY_API_SECRET: Joi.string(),
    RUNPOD_SERVERLESS_API_ID: Joi.string(),
    RUNPOD_API_KEY: Joi.string(),
    AWS_S3_ACCESS_KEY_ID: Joi.string(),
    AWS_S3_SECRET_ACCESS_KEY: Joi.string(),
    AWS_S3_BUCKET_NAME: Joi.string(),
    GCP_BUCKET_NAME: Joi.string(),
    Stable_Diffusion_API: Joi.string(),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  ttsfree_apikey: envVars.TTSFREE_API_KEY,
  cloudinary: {
    name: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    secret: envVars.CLOUDINARY_API_SECRET,
  },
  Runpod: {
    serverless_api_id: envVars.RUNPOD_SERVERLESS_API_ID,
    api_key: envVars.RUNPOD_API_KEY,
  },

  AWS: {
    access_key_id: envVars.AWS_S3_ACCESS_KEY_ID,
    secret_accesskey: envVars.AWS_S3_SECRET_ACCESS_KEY,
    bucket: envVars.AWS_S3_BUCKET_NAME,
  },
  GCP_BUCKET_NAME: envVars.GCP_BUCKET_NAME,
  StableDiffusionAPI: envVars.Stable_Diffusion_API,
};
