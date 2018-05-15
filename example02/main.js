import "babel-polyfill"
import MapDCon from '@mapd/connector/dist/browser-connector'
import * as mapd3 from "mapd3/dist/mapd3.js"
import "mapd3/dist/mapd3.css"
import sls from "single-line-string"

const connector = new window.MapdCon()
const table = "flights_2008_7M"
const query = sls`
  SELECT date_trunc(month, arr_timestamp) as key0,
  AVG(arrdelay) AS val
  FROM ${table}
  WHERE (arr_timestamp >= TIMESTAMP(0) '2008-01-01 00:00:00'
  AND arr_timestamp <= TIMESTAMP(0) '2009-01-01 11:24:00')
  AND arrdelay IS NOT NULL
  GROUP BY key0
  ORDER BY key0`

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

    return con.queryAsync(query)
  })
  .then(data => {
    console.log(data)

    let series = []
    series.push({
      group: 0, // will be non-zero for 2nd axis
      id: 0,
      label: "avg arrdelay",
      dimensionName: "arr_timestamp",
      measureName: "avg arrdelay",
      values: data.map(function (d) {
        return {
          key: Array.isArray(d.key0) ? d.key0[0] : d.key0,
          value: d.val
        }
      }).reverse()
    })

    return { series: series }
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
        keyType: "time", // time, number, string
        chartType: "line", // line, area, stackedArea, bar, stackedBar
        useScrolling: false,

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
        sortBy: null, // totalAscending, totalDescending, alphaAscending, alphaDescending

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
        // inputDateFormat:  "%m-%d-%Y",
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
