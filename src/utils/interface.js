'use strict'
const inquirer = require('inquirer')
const _ = require('lodash')
const fuzzy = require('fuzzy')
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
inquirer.registerPrompt('datepicker', require('inquirer-datepicker'))
const queue = require('./queue')

async function main(apiKey) {
    const dashboard = require('./dashboard')(apiKey)
    let orgs = await queue.limiter.schedule(() => dashboard.organizations.list()) 
    let chosenOrg = await inquirer.prompt(getOrg(orgs))
    let nets = await queue.limiter.schedule(() => dashboard.networks.list(chosenOrg.org)) 
    let chosenNet = await inquirer.prompt(getNetwork(nets))
    let product = await inquirer.prompt(getProductTypes(nets, chosenNet))
    let startDate = await inquirer.prompt({
        type: 'datepicker',
        name: 'date',
        message: 'Start Time?',
        default: new Date().toISOString(),
    })
    let endDate = await inquirer.prompt({
        type: 'datepicker',
        name: 'date',
        message: 'End Time?',
        default: new Date().toISOString(),
    })
    let clientParams = {
        startingAfter : startDate, 
        perPage : 1000, 
    }
    let clientYes = await inquirer.prompt({
        type: 'confirm',
        name: 'client',
        message: 'Search Specific Client? (Default No)',
        default: false,
    })
    if (clientYes.client){
        let clients = await queue.limiter.schedule(() => dashboard.networks.clients(chosenNet.network, clientParams)) 
            //filter out null names
            clients.forEach(function(client){
                if (client.description == null) {client.description = client.ip}
            })
        let chosenClient = await inquirer.prompt(getClient(clients))

        let params = {
            productType : product.product, 
            start : startDate.date, 
            endingBefore : endDate.date,
            clientName : chosenClient.client
        }
        return {network : chosenNet.network, params}
    }

    let params = {
        productType : product.product, 
        start : startDate.date, 
        endingBefore : endDate.date
    }
    return {network : chosenNet.network, params}
}

const getOrg = (list) => {
    let choices = list.map((org) => {
        return {
            name: org.name,
            value: org.id
        }
    }) 
    return {
        type: 'rawlist',
        message: 'Which Organization?',
        name: 'org',
        choices: choices
    }
}

const getNetwork = (list) => {
    let choices = list.map((net) => {
        return {
            name: net.name,
            value: net.id
        }
    }) 
    return {
        type: 'rawlist',
        message: 'Which Network?',
        name: 'network',
        choices: choices
    }
}
const getProductTypes = (list, net) => {
    let choices = (list.find(o => o.id === net.network))
    return {
        type: 'rawlist',
        message: 'Which Device?',
        name: 'product',
        choices: choices.productTypes
    }
}

const getClient = (list) => {
    let choices = list.map((client) => {
        return client.description
    }) 
    return {
        type: 'autocomplete',
        message: 'Which Client?',
        name: 'client',
        source: searchClients
    }
    function searchClients(answers, input) {
        input = input || ''
        return new Promise(function(resolve) {
          setTimeout(function() {
            var fuzzyResult = fuzzy.filter(input, choices)
            resolve(
              fuzzyResult.map(function(el) {
                return el.original
              })
            )
          }, _.random(30, 500))
        })
    }
}

exports.main = main