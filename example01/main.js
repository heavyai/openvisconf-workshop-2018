import "babel-polyfill"
import MapDCon from '@mapd/connector/dist/browser-connector'

const connector = new window.MapdCon()

function establishConnection() {
  return new Promise((resolve, reject) => {
    connector
      .protocol(process.env.PROTOCOL)
      .host(process.env.HOST)
      .port(process.env.PORT)
      .dbName(process.env.DATABASE)
      .user(process.env.USERNAME)
      .password(process.env.PASSWORD)
      .connect((error, con) => {
        if (error) {
          reject(error)
        } else if (con) {
          resolve(con)
        }
      })
  })
}

// connect to the mapd backend
establishConnection()
  .then(con => {
    // log the connection object
    console.log(con)

    // check the connection status
    con.getStatusAsync().then(result => console.log(result))
  })
  .catch(error => {
    throw error
  })
