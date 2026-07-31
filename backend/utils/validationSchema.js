const Joi = require("joi");

const loginBodyValidation        = (body) => Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() }).validate(body);
const signUpBodyValidation       = (body) => Joi.object({ firstName: Joi.string().min(2).required(), lastName: Joi.string().min(2).required(), email: Joi.string().email().required(), password: Joi.string().min(6).required() }).validate(body);
const refreshTokenBodyValidation = (body) => Joi.object({ refreshToken: Joi.string().required() }).validate(body);
const movieBodyValidation        = (body) => Joi.object({ title: Joi.string().required(), overview: Joi.string().required(), poster: Joi.string().uri().required(), background: Joi.string().uri().required(), trailer: Joi.string().allow("","null",null).optional(), releaseDate: Joi.date().required(), duration: Joi.number().required(), genre: Joi.array().items(Joi.string()).min(1).required(), director: Joi.string().allow("",null).optional(), cast: Joi.array().optional(), rating: Joi.alternatives().try(Joi.string(),Joi.number()).required() }).options({ allowUnknown: true }).validate(body);
const theaterBodyValidation      = (body) => Joi.object({ name: Joi.string().required() }).options({ allowUnknown: true }).validate(body);

module.exports = { loginBodyValidation, signUpBodyValidation, refreshTokenBodyValidation, movieBodyValidation, theaterBodyValidation };
