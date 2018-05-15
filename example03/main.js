import "babel-polyfill"
import MapDCon from '@mapd/connector/dist/browser-connector'
import * as mapd3 from "mapd3/dist/mapd3.js"
import "mapd3/dist/mapd3.css"

const connector = new window.MapdCon()
const table = "flights_2008_7M"

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

    // look at the fields in the flights_2008_7M table
    con.getFieldsAsync(table).then(fields => console.log(fields))

    return con.queryAsync(`SELECT carrier_name AS key0, count(*) AS val FROM ${table} GROUP BY key0 ORDER BY val desc LIMIT 5`)
  })
  .then(topN => {
    console.log(topN)

    // use the topN result from the previous query to create the actual query for our data
    return connector.queryAsync(`SELECT
      dest_city AS key0,
      CASE
        WHEN carrier_name IN
          (${topN.map(d => `'${d.key0}'`)})
        THEN carrier_name
        ELSE 'other'
      END AS key1,
      count(*) AS val
      FROM ${table}
      WHERE (
        dest_city IN (
          SELECT dest_city
          FROM ${table}
          GROUP BY dest_city
          ORDER BY count(*) DESC
          LIMIT 100
        )
      OR dest_city IS NULL)
      GROUP BY key0 ,key1
      ORDER BY val ASC`
    )
  })
  .then(data => {
    console.log(data)

    // nest our data by key1 property ('carrier_name')
    let series = mapd3.d3.nest()
      .key(d => d.key1)
      .entries(data)

    series = series.map((d, i) => ({
      group: 0,
      id: i,
      label: d.key,
      values: d.values.map(d => ({
        key: d.key0,
        value: d.val
      }))
    }))

    return { series }
  })
  .then(series => {
    const container = document.querySelector("body")
    const colors = mapd3.colors.mapdColors
    const width = 960
    const height = 400

    const chart = mapd3
      .Chart(container)
      .setConfig({
         // common
        width: width,
        height: height,
        margin: {
          top: 32,
          right: 70,
          bottom: 64,
          left: 80
        },
        keyType: "string", // time, number, string
        chartType: "stackedBar", // line, area, stackedArea, bar, stackedBar
        useScrolling: true,

        // intro animation
        isAnimated: false,
        animationDuration: 1500,

        // scale
        //colorSchema: null,
        defaultColor: "skyblue",
        xDomain: "auto",
        yDomain: "auto",
        y2Domain: "auto",

        // data
        sortBy: "totalDescending", // totalAscending, totalDescending, alphaAscending, alphaDescending

        // axis
        tickPadding: 5,
        tickSizes: 8,
        yTicks: "auto",
        y2Ticks: "auto",
        xTickSkip: "auto",
        xAxisFormat: "auto",
        yAxisFormat: "auto",
        y2AxisFormat: ".2f",
        tooltipFormat: [".4f", ".6f"],
        grid: "horizontal",
        axisTransitionDuration: 0,
        labelsAreRotated: false,

        // hover
        dotRadius: 4,

        // tooltip
        mouseChaseDuration: 0,
        tooltipIsEnabled: true,

        // format
        dateFormat: "%b %d, %Y",
        tooltipTitleDateFormat: "%b %d, %Y",
        inputDateFormat: "%m-%d-%Y",
        numberFormat: ".2f",

        // legend
        legendXPosition: "auto",
        legendYPosition: "auto",
        legendTitle: "Dataset",
        legendIsEnabled: true,

        // binning
        binningResolution: "1mo",
        binningIsAuto: true,
        binningToggles: ["10y", "1y", "1q", "1mo"],
        binningIsEnabled: false,

        // domain
        xLock: false,
        yLock: false,
        y2Lock: false,
        xDomainEditorIsEnabled: false,
        yDomainEditorIsEnabled: false,
        y2DomainEditorIsEnabled: false,

        // brush range
        // brushRangeMin: "July 01, 2017",
        // brushRangeMax: "Sept 02, 2017",
        brushRangeIsEnabled: false,

        // brush focus
        brushIsEnabled: false,

        // label
        xLabel: "X Axis Label",
        yLabel: "Y Axis Label",
        // y2Label: "Y2 Axis Label",

        // bar
        barSpacingPercent: 10,
        selectedKeys: []
      })
    .setData(series)
  })
  .catch(error => {
    throw error
  })
