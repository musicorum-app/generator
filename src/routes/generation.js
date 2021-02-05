import { authenticationMiddleware } from '../middlewares'
import messages from '../messages'

export default ({
  router,
  database,
  applicationsController
}) => {
  router.get('/generation/:id', authenticationMiddleware(applicationsController), async (req, res) => {
    const { id } = req.params

    if (!id) return res.status(404).json(messages.INVALID_GENERATION_ID)

    const find = await database.getGeneration(id)

    if (!find || find === {}) return res.status(404).json(messages.INVALID_GENERATION_ID)

    res.json(find)
  })
}
