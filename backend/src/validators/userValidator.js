const Joi = require('joi');

const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).optional(),
  lastName: Joi.string().min(2).max(100).optional(),
  role: Joi.string().valid('admin', 'project_manager', 'team_member').optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

module.exports = { updateUserSchema };
