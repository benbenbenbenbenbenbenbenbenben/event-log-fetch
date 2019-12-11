// Event Module 

//Usage:
/*
getEvents(networkID, apiKey, {
    productType : product,                      //MUST
    start : starttimeISO,                       //MUST
    endingBefore : endtimeISO,                  //MUST
    excludedEventTypes : ["events_dropped2",],
    ....
})
*/

const getEvents = async (networkId, apiKey, params) => {
    const dashboard = require('./dashboard')(apiKey)
    //Bottleneck to limit number of API calls and handle retries
    const queue = require('./queue')

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

exports.events = getEvents