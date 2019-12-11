//Example Usage: 

// Custom Variables:
const apiKey = ''
const networkID = ''

const events = require('./utils/events')

//Must Include Parameters
let params = {
    productType: 'appliance',
    start: '2019-12-10T12:26:01.526Z',
    endingBefore: '2019-12-10T15:26:02.587Z'
  }

async function call() {
    let result = await events.events(networkID, apiKey, params)
    //Do whatever with the result
    console.log(result)
}
call()
