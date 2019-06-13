import elasticsearch from 'elasticsearch';

/**
 * Finds spelling mistakes and predicts the correct word.
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `text` The text to check
 * @arg {Select[ar,zh-CN,zh-HK,zh-TW,da,nl-BE,nl-NL,en-AU,en-CA,en-IN,en-ID,en-MY,en-NZ,en-PH,en-ZA,en-GB,en-US,fi,fr-BE,fr-CA,fr-FR,fr-CH,de-AT,de-DE,de-CH,it,ja,ko,no,pl,pt-BR,pt-PT,ru,es-AR,es-CL,es-MX,es-ES,es-US,sv,tr]} `language` The texts language
 * @arg {Boolean} `writeToContext` Whether to write to Cognigy Context (true) or Input (false)
 * @arg {CognigyScript} `store` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function simpleSearch(input: IFlowInput, args: { secret: CognigySecret, text: string, language: string, writeToContext: boolean, store: string, stopOnError: boolean }): Promise<IFlowInput | {}>  {
    // Check if secret exists and contains correct parameters
    if (!args.secret || !args.secret.key || !args.secret.host) return Promise.reject("Secret not defined or invalid.");
    if (!args.text) return Promise.reject("No text defined.");

    return new Promise((resolve, reject) => {
        let result = {};

        const client = new elasticsearch.Client({
            host: args.secret.host,
            log: 'trace'
        });

        client.search({
            q: 'pants'
        }).then( (body) => {
            result = body.hits.hits;
            if (args.writeToContext) input.context.getFullContext()[args.store] = result;
            else input.input[args.store] = result;
            resolve(input);
        }, (err) => {
            if (args.stopOnError) { reject(err.message); return; }
            result = { "error": err.message };
            if (args.writeToContext) input.context.getFullContext()[args.store] = result;
            else input.input[args.store] = result;
            resolve(input);
        });

    });
}
module.exports.simpleSearch = simpleSearch;

