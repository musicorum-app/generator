import { authenticationMiddleware } from '../../middlewares'
import messages from '../../messages'

export default ({
  router,
  database,
  applicationsController
}) => {
  router.get('/generations/:id', authenticationMiddleware(applicationsController), async (req, res) => {
    const { id } = req.params

    const s = new Date().getTime()
    if (!id) return res.status(404).json(messages.INVALID_GENERATION_ID)

    const find = await database.getGeneration(id)

    if (!find || find === {}) return res.status(404).json(messages.INVALID_GENERATION_ID)

    res.json(find)

    console.log('Generation endpoint took ' + (new Date().getTime() - s) + 'ms')
  })
}
