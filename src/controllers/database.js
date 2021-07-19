import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default class DatabaseController {
  constructor ({ logger }) {
    this.logger = logger
  }

  async findApplicationByKey (where) {
    return prisma.application.findFirst({
      where
    })
  }

  async insertGeneration (data) {
    return prisma.generation.create({ data })
  }

  async getGeneration (id) {
    const result = await prisma.generation.findFirst({
      where: {
        id
      },
      select: {
        application: {
          select: {
            id: true,
            name: true
          }
        },
        id: true,
        status: true,
        total_duration: true,
        render_duration: true,
        file: true,
        theme: true,
        created_at: true
      }
    })
    return result
  }

  getUserByTwitterId (id) {
    return this.models.User.findOne({
      where: {
        twitterId: id
      }
    })
  }

  async createUserWithTwitter (usr) {
    return (await (this.models.User.build(usr)).save()).dataValues
  }
}
