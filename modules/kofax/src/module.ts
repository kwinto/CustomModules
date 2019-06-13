import axios from 'axios';

/**
 * Runs a robot
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {JSON} `body` The data body for POST request
 * @arg {CognigyScript} `contextStore` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function RunRobot(input: IFlowInput, args: { secret: CognigySecret, robot: string, project: string, body: JSON, contextStore: string, stopOnError: boolean }): Promise<IFlowInput | {}> {

    const { secret, body, contextStore, stopOnError } = args;
    const { api_key } = secret;
    // Check if secret exists and contains correct parameters
    if (!secret) throw new Error('Not secret defined.');
    if (!body) throw new Error('No JSON body defined.');

    // Check if the secret is given
    if (!api_key) throw new Error("The secret is missing the 'api_key' field.");

    try {
        const response = await axios.post(`https://request-forwarder.cognigy.ai/forward`, body, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-API-Key': api_key
            }
        });

        input.actions.addToContext(contextStore, response.data, 'simple');
    } catch (error) {
        if (stopOnError) {
            throw new Error(error.message);
        } else {
            input.actions.addToContext(contextStore, { error: error.message }, 'simple');
        }
    }

    return input;
}

module.exports.RunRobot = RunRobot;

