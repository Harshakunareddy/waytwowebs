const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().min(2).max(255).required(),
  description: Joi.string().allow('', null).optional(),
  projectId: Joi.number().integer().positive().required(),
  assigneeId: Joi.number().integer().positive().allow(null).optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
  status: Joi.string().valid('to_do', 'in_progress', 'in_review', 'done').optional(),
  dueDate: Joi.date().iso().required(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(2).max(255).optional(),
  description: Joi.string().allow('', null).optional(),
  assigneeId: Joi.number().integer().positive().allow(null).optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
  status: Joi.string().valid('to_do', 'in_progress', 'in_review', 'done').optional(),
  dueDate: Joi.date().iso().optional(),
}).min(1);

const commentSchema = Joi.object({
  content: Joi.string().min(1).max(5000).required(),
});

module.exports = { createTaskSchema, updateTaskSchema, commentSchema };
