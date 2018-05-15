# MapD OpenVisConf Workshop

Materials for the MapD workshop at OpenVisConf 2018, Paris.

## Examples

- [01: Connecting to MapD-Core Using Mapd-Connector](./example01)

- [02: Creating a Line Chart with MapD3](./example02)

- [03: Creating a Stacked Bar Chart with MapD3](./example03)

## Install
You will need to have NodeJS and NPM installed on your computer.

Clone or download this repository then install the dependencies using `npm` or `yarn`:

Using `npm`:

```
npm install
```

Using `yarn`

```
yarn install
```

## Environment Variables
To run these examples you'll need an AWS MapD Instance available to connect to.

Add a `.env` file to the root of this repository with the following:

```
DATABASE=mapd
USERNAME=mapd
PASSWORD=<password>
HOST=<host>
PORT=<port>
PROTOCOL=https
```

## Run Examples
There are multiple examples in this repository, you may run them one at a time by doing:

```
npm run example01
```

or

```
npm run example02
```

etc.

## DB Tables
This repository assumes you have the following default tables on your AWS Instance:

```
flights_2008_7M
nyc_trees_2015_683k
taxi_weather_tracts_factual
```
