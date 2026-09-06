// Validation utilities for DRISHTI
// Uses Joi for input validation

const Joi = require('joi');

// User registration validation
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 50 characters'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address'
  }),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    'string.empty': 'Phone number is required',
    'string.pattern.base': 'Phone number must be exactly 10 digits'
  }),
  password: Joi.string().min(8).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters long'
  }),
  role: Joi.string().valid('DRIVER', 'POLICE', 'CITIZEN', 'ADMIN').default('CITIZEN')
});

// User login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required'
  })
});

module.exports = {
  registerSchema,
  loginSchema
};