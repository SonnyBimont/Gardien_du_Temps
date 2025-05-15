const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

// POST: Authentifie un utilisateur et retourne un token JWT
router.post('/login', authController.login);

// Route pour récupérer le profil de l'utilisateur connecté
router.get('/me', protect, authController.getMe);

// Route de déconnexion (côté client - invalide le token)
router.post('/logout', protect, (req, res) => {
    res.status(200).json({ success: true, message: 'Déconnexion réussie' });
});

// Route pour rafraîchir le token JWT
// POST: Génère un nouveau token JWT si l'actuel est valide
router.post('/refresh-token', protect, authController.refreshToken);

module.exports = router;