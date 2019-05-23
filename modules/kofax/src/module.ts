import axios from 'axios';

/**
 * Runs a robot
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {JSON} `body` The data body for POST request
 * @arg {CognigyScript} `store` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function RunRobot(input: IFlowInput, args: { secret: CognigySecret, robot: string, project: string, body: JSON, store: string, stopOnError: boolean }): Promise<IFlowInput | {}> {

    // Check if secret exists and contains correct parameters
    if (!args.secret || !args.secret.api_key) return Promise.reject("Secret not defined or invalid.");
    if (!args.body) return Promise.reject("No JSON body defined.");

    return new Promise((resolve, reject) => {

        axios.post(`https://request-forwarder.cognigy.ai/forward`, args.body, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-API-Key': args.secret.api_key
            }
        }).then((response) => {
            input.context.getFullContext()[args.store] = response.data;
            resolve(input);
        }).catch((err) => {
            if (args.stopOnError) { reject(err.message); return; }
            input.context.getFullContext()[args.store] = { "error": err.message };
            resolve(input);
        });
    });
}

module.exports.RunRobot = RunRobot;

