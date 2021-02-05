import { authenticationMiddleware } from '../../../middlewares'
import HTTPErrorMessage from '../../../utils/HTTPErrorMessage'
import messages from '../../../messages'

export default ({
  router,
  logger,
  applicationsController,
  twitterController,
  usersController
}) => {
  router.get('/auth/social/twitter', authenticationMiddleware(applicationsController), async (req, res) => {
    try {
      const token = await twitterController.createTokenSecret()

      res.json(token)
    } catch (e) {
      if (e instanceof HTTPErrorMessage) {
        return res.status(e.code).json(e.err)
      }

      res.status(500).json(messages.INTERNAL_ERROR)
      logger.error(e)
    }
  })

  router.post('/auth/social/twitter', authenticationMiddleware(applicationsController), async (req, res) => {
    try {
      const {
        token_id: tokenId,
        oauth_token: oauthToken,
        oauth_verifier: oauthVerifier
      } = req.body

      if (!tokenId || !oauthToken || !oauthVerifier) throw new HTTPErrorMessage(messages.MISSING_PARAMS)

      const {
        userId,
        userToken,
        userTokenSecret
      } = await twitterController.doCallback(tokenId, oauthToken, oauthVerifier)

      const user = await usersController.handleUserByTwitterData({
        id: userId,
        token: userToken,
        secret: userTokenSecret
      })

      const formattedUser = await usersController.formatUserData(user)

      res.json(formattedUser)
    } catch (e) {
      if (e instanceof HTTPErrorMessage) return res.status(e.code).json(e.err)

      res.status(500).json(messages.INTERNAL_ERROR)
      logger.error(e)
      console.error(e)
    }
  })
}
