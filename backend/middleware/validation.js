import Joi from 'joi';

export const validateArticle = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().max(500),
    content: Joi.string().required(),
    summary: Joi.string().max(1000),
    sourceUrl: Joi.string().uri().required(),
    publishedAt: Joi.date().required(),
    category: Joi.string().valid('breaking', 'threats', 'data-breaches', 'policy', 'research', 'industry').required(),
    tags: Joi.array().items(Joi.string()),
    imageUrl: Joi.string().uri(),
    featured: Joi.boolean(),
    breaking: Joi.boolean()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

export const validateQuery = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    category: Joi.string().valid('breaking', 'threats', 'data-breaches', 'policy', 'research', 'industry'),
    tags: Joi.string(),
    search: Joi.string(),
    sortBy: Joi.string().valid('publishedAt', 'title', 'engagement.views').default('publishedAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    featured: Joi.boolean(),
    breaking: Joi.boolean(),
    threatLevel: Joi.string().valid('low', 'medium', 'high', 'critical')
  });

  const { error, value } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  req.query = value;
  next();
};