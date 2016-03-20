// Contrôleur de l’accueil
// =======================

import { Router } from 'express'

// Chaque contrôleur exporte un routeur Express.
const router = new Router()

router.get('/', (req, res) => res.render('home'))

export default router
