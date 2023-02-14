const router = require('express').Router();

// Endpoint to retrieve the userId
router.get('/session/userid', (req, res) => {
    const userId = req.session.userId;
    if (userId) {
      res.send({ userId });
    } else {
      res.status(404).send({ error: 'No userId found in the session' });
    }
  });

module.exports = {
    router
}