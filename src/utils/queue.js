const Bottleneck = require("bottleneck")

// Queues API Calls to prevent Meraki API Call limit
const limiter = new Bottleneck({
    minTime: 200,
    trackDoneStatus: true
  })

// Listen to failed call, retry again after 1 second
limiter.on("failed", async (error, jobInfo) => {
    if (jobInfo.retryCount <= 2) { // Here we only retry once
      let backOff = 1000
      console.log(`Retrying request in ${backOff}ms!`)
      return backOff
    }
  })

exports.limiter = limiter