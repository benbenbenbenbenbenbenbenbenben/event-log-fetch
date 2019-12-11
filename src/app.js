// Custom Variables:
const config = require('./utils/config')
const apiKey = config.api

const lineBreak = '======================================='

const dashboard = require('./utils/dashboard')(apiKey)
const interface = require('./utils/interface') // ignore if not using CLI
const fs = require('fs') //Save and Read JSON
const ObjectsToCsv = require('objects-to-csv')
//Bottleneck to limit number of API calls and handle retries
const queue = require('./utils/queue')

const main = async () => {
    //Load CLI Interface
    let details = await interface.main(apiKey)
    //Run Timer
    var hrstart = process.hrtime()
    //Get Events
    let result = await getEvents(details.network, details.params)
    //Store CSV and JSON files
    storeCsv(result)
    storeJson(result)
    //End Timer
    var hrend = process.hrtime(hrstart)
    //Log Completion
    console.log(lineBreak)
    console.log('Completed,',result.length, 'events fetched')
    console.log('Execution time: %ds %dms', hrend[0], hrend[1] / 1000000)
    console.log(lineBreak)
}

main()

const getEvents = async (networkId, params) => {
    let currentDate = params.endingBefore, start = params.start, result = []

    //Customize how many events are retrieved per call (3-1000). If too many 500 errors, reduce to 500 evemts
    const eventsPerCall = 1000

    //Check if product for SM is parsed correctly
    if (params.productType == 'systems manager'){
        params.productType = 'systemsManager'
    }
    do {
        //Add additional params if required
        params.perPage = eventsPerCall
        // params.excludedEventTypes = ["events_dropped2",]

        //Mandatory to update new timestamp for each call
        params.endingBefore = currentDate
        //Make api call for events
        let events = await queue.limiter.schedule(() => dashboard.events.get(networkId, params)) 
        //Add new events to existing events
        result = [...result, ...events.events]
        //Message returned if no more matching events found
        if(events.message){
            console.log(events.message) 
            return result //Exit
        }
        console.log('Timestamp:',events.pageStartAt)
        currentDate = events.pageStartAt
    } while (new Date(start) < new Date(currentDate))

    //Remove any excess events before start date
    const endOfArray = result.findIndex(result => new Date(result.occurredAt) < new Date(start))
    result.length = endOfArray

    console.log('Events timeline reached')
    return result
}

const storeJson = async (json) => {
    let data = JSON.stringify(json, null, 2)
    fs.writeFile('events.json', data, (err) => {
        if (err) throw err
        console.log('JSON file saved: events.json')
    })
}

const storeCsv = async (csv) => {
    let convertedCsv = new ObjectsToCsv(csv)
    // Save to file:
    await convertedCsv.toDisk('./events.csv')
}
