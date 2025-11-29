// Lightweight validation helpers used by routes/controllers.
// These helpers perform small, common checks and (when appropriate)
// normalize values on `req` so handlers can assume parsed types.
module.exports = {
  requireNumericParam: (paramName) => (req, res, next) => {
    const val = req.params[paramName];
    const n = parseInt(val, 10);
    if (Number.isNaN(n)) {
      return res.status(400).json({ error: `${paramName} must be a number` });
    }
    // attach parsed value to request for use by handlers
    req.params[paramName] = n;
    next();
  },

  // Ensure required body fields are present. This does not validate types,
  // only presence / non-null. For stricter validation, consider using
  // a schema-validation library (Joi, Zod, Yup, etc.).
  requireBodyFields: (fields) => (req, res, next) => {
    const missing = fields.filter((f) => req.body[f] == null);
    if (missing.length) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
    }
    next();
  },
};
