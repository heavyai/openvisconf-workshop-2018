# Example 01: Connecting to a MapD-Core

In this is example we'll connect to our MapD Core database and renderer.

You'll need to add a `.env` file to the root of this repository with the following:

```
DATABASE=mapd
USERNAME=mapd
PASSWORD=<password>
HOST=<host>
PORT=<port>
PROTOCOL=https
```

Note that the parts with `<value>` will need to be replaced with actual values.
We will provide these values for you during the workshop, and they may be changed
later to connect to a different MapD instance on AWS.
