import * as DiscoveryV1 from 'ibm-watson/discovery/v1';

/**
 * Describes the function
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `environment_id` The environment ID
 * @arg {CognigyScript} `collection_id` The collection ID
 * @arg {CognigyScript} `version` The version to use
 * @arg {CognigyScript} `natural_language_query` The natural language query to run
 * @arg {CognigyScript} `query` The query to run
 * @arg {JSON} `other_parameters` Further Discovery parameters
 * @arg {Boolean} `writeToContext` Whether to write to Cognigy Context (true) or Input (false)
 * @arg {CognigyScript} `store` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function discovery(input: IFlowInput, args: { secret: CognigySecret, environment_id: string, collection_id: string, version: string, natural_language_query: string, query: string, other_parameters: any, writeToContext: boolean, store: string, stopOnError: boolean }): Promise<IFlowInput | {}> {
	// Check if secret exists and contains correct parameters  
	if (!args.secret || !args.secret.iam_apikey || !args.secret.url) return Promise.reject("Secret not defined or invalid - needs iam_apikey and url.");

    // instantiate discovery instance
    const discoveryInstance = new DiscoveryV1({
        version: args.version,
        iam_apikey: args.secret.iam_apikey,
        url: args.secret.url
    });

    if (typeof args.other_parameters !== 'object') args.other_parameters = {};

    // set query parameters
    const queryParams: DiscoveryV1.QueryParams = {
        environment_id: args.environment_id,
        collection_id: args.collection_id,
        count: args.other_parameters.count || 1,
        ...args.other_parameters
    };

    console.log(JSON.stringify(queryParams));

    // either use natural language query or regular query
    if (args.natural_language_query) queryParams.natural_language_query = args.natural_language_query;
    else if (args.query) queryParams.query = args.query;

    // query for result and handle errors
    let result = {};
    try {
        result = await discoveryInstance.query(queryParams)
    } catch(err) {
        if (args.stopOnError) { throw(err); }
        else result = { "error": err.message };
    }

    // set result
    if (args.writeToContext) input.context.getFullContext()[args.store] = result;
    else input.input[args.store] = result;

    return input;
}

// You have to export the function, otherwise it is not available
module.exports.discovery = discovery;


const secret = {
    "iam_apikey": "XwXGQCTn61BZyFKWua5MndpxWSJTjoGAISlPXGwArF1R",
    "url": "https://gateway-lon.watsonplatform.net/discovery/api"
}

const args = {
    "secret": secret,
    environment_id: 'system',
    collection_id: 'news-en',
    version: "2018-12-03",
    natural_language_query: 'Cognigy',
    query: '',
    other_parameters: { "count": 1, "passages": true, "passages.count": 5, "return": "results", "deduplicate": false },
    writeToContext: false, 
    store: "test", 
    stopOnError: false
}

discovery({ "input": {}, "context": {}, "profile": {}, "actions": {}, "data": {}}, args)
.then((input) => {
    console.log(JSON.stringify(input, undefined, 4).length);
})