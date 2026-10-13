const Joi = require('joi');

const createProjectSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().allow('', null).optional(),
  startDate: Joi.date().iso().required(),
  deadline: Joi.date().iso().min(Joi.ref('startDate')).required(),
  status: Joi.string().valid('planning', 'active', 'on_hold', 'completed').optional(),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  description: Joi.string().allow('', null).optional(),
  startDate: Joi.date().iso().optional(),
  deadline: Joi.date().iso().optional(),
  status: Joi.string().valid('planning', 'active', 'on_hold', 'completed').optional(),
}).min(1);

const addMemberSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
});

module.exports = { createProjectSchema, updateProjectSchema, addMemberSchema };
