import LWT from 'login-with-twitter'
import Twit from 'twit'
import { loadConfiguration } from '../utils'
import { nanoid } from 'nanoid'
import HTTPErrorMessage from '../utils/HTTPErrorMessage'
import messages from '../messages'

const config = loadConfiguration()

export default class TwitterAuthController {
  constructor ({
    redis,
    database,
    logger
  }) {
    this.redis = redis
    this.database = database
    this.logger = logger

    this.tw = new LWT({
      consumerKey: process.env.TWITTER_KEY,
      consumerSecret: process.env.TWITTER_SECRET,
      callbackUrl: config.auth.twitter.callback
    })
  }

  async createTokenSecret () {
    return new Promise((resolve, reject) => {
      this.tw.login((err, tokenSecret, url) => {
        if (err) return reject(err)

        const tokenId = nanoid(32)
        this.redis.setTwitterTokenSecret(tokenId, tokenSecret)
          .then(() => {
            resolve({
              token_id: tokenId,
              url
            })
          })
      })
    })
  }

  async doCallback (tokenId, oauthToken, oauthVerifier) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const tokenSecret = await this.redis.getTwitterTokenSecret(tokenId)
      if (!tokenSecret) return reject(new HTTPErrorMessage(messages.INVALID_TOKEN_ID))

      this.tw.callback({
        oauth_token: oauthToken,
        oauth_verifier: oauthVerifier
      }, tokenSecret, (err, user) => {
        if (err || user === {} || !user.userId) return reject(new HTTPErrorMessage(messages.INVALID_TOKENS))

        resolve(user)
      })
    })
  }

  createTwitFromTokens (token, secret) {
    return new Twit({
      consumer_key: process.env.TWITTER_KEY,
      consumer_secret: process.env.TWITTER_SECRET,
      access_token: token,
      access_token_secret: secret
    })
  }

  async getTwitterAccountByTokens (token, secret) {
    const T = this.createTwitFromTokens(token, secret)
    this.logger.silly('Doing request to TwitterAPI')
    const res = await T.get('account/verify_credentials', { skip_status: true })

    if (!res.data) throw new HTTPErrorMessage(messages.INTERNAL_ERROR)
    return res.data
  }
}
