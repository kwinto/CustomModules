import elasticsearch from 'elasticsearch';

/**
 * Simple elastic search.
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `query` The search query
 * @arg {CognigyScript} `contextStore` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function simpleSearch(input: IFlowInput, args: { secret: CognigySecret, query: string, language: string, contextStore: string, stopOnError: boolean }): Promise<IFlowInput | {}>  {

    const { secret, query, contextStore, stopOnError } = args;
    const { host } = secret;

    if (!secret) throw new Error('No secret defined');
    if (!host) throw new Error("The secret is missing the 'host' field");
    if (!query) throw new Error("No search query defined");
    if (!contextStore) throw new Error("No context store defined");


    const client = new elasticsearch.Client({
        host,
        log: 'trace'
    });

    try {
        const body = await client.search({q: query});

        input.actions.addToContext(contextStore, body, 'simple');
    } catch (error) {
        if (stopOnError) {
            throw new Error(error.message);
        }
        input.actions.addToContext(contextStore, { error: error.message }, 'simple');
    }

    return input;
}

module.exports.simpleSearch = simpleSearch;

