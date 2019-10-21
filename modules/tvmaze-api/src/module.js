const request = require('request-promise-native');

/**
 * Search Single Show
 * @arg {CognigyScript} `query` The search query for the show
 * @arg {CognigyScript} `store` Where to store the result
 */
async function searchSingleShow(cognigy, args) {
    const { query, store } = args;

    // call the tvmaze api, 
    // use the searchsingle call, 
    // append the query as a query parameter
    const result = await request(`http://api.tvmaze.com/singlesearch/shows?q=${query}`);

    cognigy.context.getFullContext()[store] = JSON.parse(result);

    return cognigy;
}

module.exports.searchSingleShow = searchSingleShow;