import { authenticationMiddleware } from '../middlewares'

export default ({
  router,
  workersController,
  applicationsController
}) => {
  router.get('/workers', authenticationMiddleware(applicationsController), async (req, res) => {
    res.json({
      workers: workersController.workers
    })
  })
}
