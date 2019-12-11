# Cisco Meraki - Event Log Fetcher

Return JSON of Meraki Dashboard event logs between start time and end time.
Iterates backwards from end time event until start time event.
Option to use CLI and save JSON and CSV file.

## Features

- [x] Nodejs application
- [x] Queue system for API calls, automatic retries on 400/500 errors
- [x] CLI to select organization, network, device type, start and end times and option to select a specific client
- [x] Save to JSON and CSV files

<img src="https://kersnovske.com/meraki/images/event-log.png" width="500px" height="300px">

## CLI Demo
<br>
<img src="https://kersnovske.com/meraki/images/event-log-cli.gif">

## Installation

Two Methods:
- [x] CLI Application
- [x] As a Module

#### CLI Application

Clone the source locally:

```sh
$ git clone https://github.com/benbenbenbenbenbenbenbenbenben/event-log-fetch.git
$ cd event-log-fetch
```

Install `npm` and `nodejs`:

```sh
$ sudo apt-get install npm nodejs
```

Install project dependencies:

```sh
$ npm install
```

Add your Meraki api key to src/utils/config.js

Run application:

```sh
$ node src/app.js
```

#### Module

Clone the source locally:

```sh
$ git clone https://github.com/benbenbenbenbenbenbenbenbenben/event-log-fetch.git
$ cd event-log-fetch
```

Install project dependencies:

```sh
$ npm install bottleneck axios
```

Required files:
```js
utils/events.js
utils/dashboard.js
utils/queue.js
```

#### See src/example.js for basic use case:

From your script require the events.js file:
```js
const events = require('./utils/events')
```

If using async for function call:
```js
async function call() {
    let result = await events.events(networkID, apiKey, params)
    //Do whatever with the result
    console.log(result)
}
```
Must include parameters as below:
```js
let params = {
    productType: 'appliance',
    start: '2019-12-10T12:26:01.526Z',
    endingBefore: '2019-12-10T15:26:02.587Z'
  }
```
See full list of parameters available:
https://developer.cisco.com/meraki/api/#/rest/api-endpoints/events/get-network-events

Run example file:

```sh
$ node src/example.js
```

## Notes

Searching clients by name: 
Manually overidden client names do not update in eventlog clientName, search by Mac for better results.

## Dependencies

- Bottleneck
- Axios
- Inquirer (if using CLI)

## License

MIT © Ben 2019
