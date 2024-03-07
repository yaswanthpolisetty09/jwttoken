const express = require('express')
const app = express()
app.use(express.json())

const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const jst = require('jsonwebtoken')

const dbPath = path.join(__dirname, 'covid19IndiaPortal.db')

let db = null

const initialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('http://localhost:3000/ server is running ')
    })
  } catch (e) {
    console.log(`DB error ${e.message}`)
    process.exit(1)
  }
}

initialize()

app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  const que1 = `select * from user where username='${username}';`
  const usn = await db.get(que1)
  if (usn === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const ispass = await bcrypt.compare(password, usn.password)
    if (ispass) {
      const payload = {
        username: username,
      }
      const jwtToken = jst.sign(payload, 'MY_SECRET_TOKEN')
      response.send({jwtToken})
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})

const aunthtoken = (request, response, next) => {
  let jwttoken
  const authhead = request.headers['authorization']
  if (authhead !== undefined) {
    jwttokem = authhead.split(' ')[1]
  }
  if (jwttoken === undefined) {
    response.status(401)
    response.send('Invalid JWT Token')
  } else {
    jst.verify(jwttoken, 'MY_SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.status(401)
        response.send('invalid jsontoken ')
      } else {
        next()
      }
    })
  }
}

app.get('/states/', aunthtoken, async (request, response) => {
  const iop = `select * from state;`
  const que2 = await db.all(iop)
  response.send(que2)
})

app.get('/states/:stateId/', aunthtoken, async (request, response) => {
  const {stateId} = request.params
  const que3 = `select * from state where state_id=${stateId};`
  const abcd = await db.get(que3)
  response.send(abcd)
})

app.get('/districts/', aunthtoken, async (request, response) => {
  const que5 = `select * from district;`
  const ans = await db.all(que5)
  response.send(ans)
})

app.get('/districts/:districtId/', aunthtoken, async (request, response) => {
  const {districtId} = request.params
  const que6 = `select * from district where district_id=${districtId};`
  const rcb = await db.get(que6)
  response.send(rcb)
})

app.delete('/districts/:districtId/', aunthtoken, async (request, response) => {
  const {districtId} = request.params
  const que7 = ` delete from district where district_id=${districtId};`
  const mi = await db.run(que7)
  response.send('District Remove')
}) 





module.exports = app
