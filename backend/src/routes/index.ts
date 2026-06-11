import { Router } from 'express';
import helloRouter from './hello.js';
import authRouter from './auth.js';
import gamesRouter from './games.js';
import genresRouter from './genres.js';
import userRoutes from './user.js';
import libraryRouter from './library.js';
import cartRouter from './cart.js';
import friendsRouter from './friends.js';
import checkoutRouter from './checkout.js';
import wishlistRouter from './wishlist.js';
import reviewsRouter from './reviews.js';
import adminRouter from './admin.js';
import favoritesRouter from './favorites.js';
import giftsRouter from './gifts.js';
import developerRouter from './developer.js';

const router: Router = Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/hello', helloRouter);
router.use('/auth', authRouter);
router.use('/games', gamesRouter);
router.use('/genres', genresRouter);
router.use('/users', userRoutes);
router.use('/library', libraryRouter);
router.use('/cart', cartRouter);
router.use('/friends', friendsRouter);
router.use('/checkout', checkoutRouter);
router.use('/wishlist', wishlistRouter);
router.use('/reviews', reviewsRouter);
router.use('/admin', adminRouter);
router.use('/favorites', favoritesRouter);
router.use('/gifts', giftsRouter);
router.use('/developer', developerRouter);

export default router;
