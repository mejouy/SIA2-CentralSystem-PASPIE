const System = require('../model/system.model');

const verifyApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ success: false, error: 'API key is missing.' });
  }

  try {
    const system = await System.findOne({ apiKey, status: 'Active' });
    if (!system) {
      return res.status(403).json({ success: false, error: 'Invalid or suspended API key.' });
    }
    
    // Attach system details to the request for logging
    req.system = system; 
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = verifyApiKey;