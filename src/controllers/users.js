import { DataTypes } from 'sequelize'
import { nanoid } from 'nanoid'

export default class UsersController {
  constructor ({
    redis,
    database,
    logger,
    twitterController
  }) {
    this.redis = redis
    this.database = database
    this.logger = logger
    this.twitter = twitterController
  }

  async handleUserByTwitterData ({
    id,
    token,
    secret
  }) {
    const dbUser = await this.database.getUserByTwitterId(id)
    if (dbUser) return dbUser
    console.log(dbUser)

    return this.database.createUserWithTwitter({
      id: nanoid(24),
      twitterToken: token,
      twitterSecret: secret,
      twitterId: id
    })
  }

  async formatUserData ({
    id,
    twitterToken,
    twitterSecret,
    twitterId,
    lastfmToken,
    updatedAt,
    createdAt
  }) {
    let lastfm = null
    let twitter = null

    console.log(twitterToken)

    if (twitterId) {
      const twitterUser = await this.redis.getTwitterUserCache(twitterId)
      if (twitterUser) {
        twitter = twitterUser
      } else {
        const twitterResp = await this.twitter.getTwitterAccountByTokens(twitterToken, twitterSecret)
        twitter = {
          id: twitterId,
          name: twitterResp.name,
          user: twitterResp.screen_name,
          picture: twitterResp.profile_image_url_https.replace('_normal', '')
        }

        this.redis.setTwitterUserCache(twitterId, twitter)
      }
    }

    return {
      id,
      created_at: createdAt,
      lastfm,
      twitter
    }
  }
}
