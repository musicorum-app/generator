export default class ApplicationsController {
  constructor ({
    logger,
    database,
    redis
  }) {
    this.logger = logger
    this.database = database
    this.redis = redis
  }

  async getApplicationByKey (key) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async resolve => {
      const redisSearch = await this.redis.getApplicationByKey(key)
      if (redisSearch && redisSearch !== {} && redisSearch.id) {
        return resolve({
          ...redisSearch,
          key
        })
      }

      const find = await this.database.findApplicationByKey({
        key
      })
      resolve(find)
      if (find) {
        this.redis.setApplication(find)
      }
    })
  }
}
