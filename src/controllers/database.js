import { Sequelize, DataTypes } from 'sequelize'

export default class DatabaseController {
  constructor ({ logger }) {
    this.logger = logger
    this.ready = false
    this.models = {}
    this.connect()
      .then(() => {
        this.createModels()
      })
  }

  async connect () {
    const uri = process.env.SQL_URI
    if (!uri) {
      this.logger.error('SQL_URI environment var not defined.')
      process.exit(2)
    }
    this.client = new Sequelize(uri, {
      logging: m => this.logger.debug(`Database: ${m}`)
    })

    try {
      await this.client.authenticate()
      this.logger.info('SQL connected successfully.')
    } catch (e) {
      this.logger.error('Not possible to connect to database: ' + e)
    }
  }

  createModels () {
    this.models.Application = this.client.define('Application', {
      id: {
        type: DataTypes.STRING(16),
        allowNull: false,
        primaryKey: true
      },
      key: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      secret: {
        type: DataTypes.STRING(32),
        allowNull: false
      }
    })

    this.models.Generation = this.client.define('Generation', {
      id: {
        type: DataTypes.STRING(24),
        allowNull: false,
        primaryKey: true
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      totalDuration: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      renderDuration: {
        type: DataTypes.FLOAT
      },
      file: {
        type: DataTypes.TEXT
      },
      theme: {
        type: DataTypes.STRING(32)
      },
      error: {
        type: DataTypes.TEXT
      },
      appId: {
        type: DataTypes.STRING(16),
        allowNull: false,
        references: {
          model: 'Applications',
          key: 'id'
        }
      }
    })

    // this.models.Generation.associate = models => {
    //   console.log('aa')
    this.models.Generation.belongsTo(this.models.Application, {
      foreignKey: 'appId',
      as: 'source'
    })
    // }

    for (const m of Object.keys(this.models)) {
      const model = this.models[m]
      model.sync()
        .then(() => {
          this.logger.info(`'${m}' model synced.`)
        })
        .catch(e => {
          this.logger.error(`Failed to sync model '${m}': ${e}.`)
        })
    }

    this.ready = true
  }

  checkReady () {
    if (this.ready) {
      return true
    } else {
      this.logger.warn('Database not connected yet!')
      return false
    }
  }

  async findApplicationByKey (where) {
    if (!this.checkReady()) return null
    const [result] = await this.models.Application.findAll({
      where
    })
    return result ? result.dataValues : null
  }

  async insertGeneration (generation) {
    await (this.models.Generation.build(generation)).save()
  }

  async getGeneration (id) {
    const [result] = await this.models.Generation.findAll({
      where: {
        id
      },
      include: [{
        model: this.models.Application,
        attributes: ['id', 'name'],
        as: 'source'
      }],
      attributes: [
        'id',
        'status',
        ['totalDuration', 'total_duration'],
        ['renderDuration', 'render_duration'],
        'file',
        'theme',
        ['createdAt', 'created_at'],
      ]
    })
    return result
  }
}
