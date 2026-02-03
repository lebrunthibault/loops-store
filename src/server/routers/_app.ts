import { router } from '../trpc'
import { loopsRouter } from './loops'
import { genresRouter } from './genres'
import { purchasesRouter } from './purchases'
import { adminRouter } from './admin'

export const appRouter = router({
  loops: loopsRouter,
  genres: genresRouter,
  purchases: purchasesRouter,
  admin: adminRouter,
})

export type AppRouter = typeof appRouter
