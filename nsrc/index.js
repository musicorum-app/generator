const express = require('express')
const chalk = require('chalk')

const routes = require('./routes')
const morgan = require('./utils/morgan')

const app = express()

app.use(express.json())
app.use(routes)
app.use(morgan())

app.listen(3000, () => console.log(
  chalk.greenBright(' SUCCESS ') + ' Web server started on port ' + chalk.blue(this.port)
))
