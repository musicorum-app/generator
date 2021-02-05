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
    return this.database.findApplicationByKey({
      key
    })
  }
}
