import axios from 'axios';

/**
 * Runs a robot
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `robot` The name of the robot you want to start, e.g. SearchHardware. Please don't add the prefix '.robot' to the name!
 * @arg {CognigyScript} `project` The name of the project where the robot is located
 * @arg {JSON} `body` The data body for POST request
 */
async function RunRobot(input: IFlowInput, args: { secret: CognigySecret, robot: string, project: string, body: JSON }): Promise<IFlowInput | {}> {

    // Check if secret exists and contains correct parameters
    if (!args.secret || !args.secret.server || !args.secret.api_key) return Promise.reject("Secret not defined or invalid.");
    if (!args.robot) return Promise.reject("No robot name defined.");
    if (!args.body) return Promise.reject("No JSON body defined.");
    if (!args.project) return Promise.reject("No project defined.");

    axios.post(`https://request-forwarder.cognigy.ai/forward`, args.body, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-API-Key': args.secret.api_key
        }
    }).catch((err) => {
        input.actions.log("error", err);
        return input;
    });
}

module.exports.RunRobot = RunRobot;

