import axios from 'axios';

/**
 * Runs a robot
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `robot` The name of the robot you want to start, e.g. SearchHardware. Please don't add the prefix '.robot' to the name!
 * @arg {CognigyScript} `project` The name of the project where the robot is located
 * @arg {CognigyScript} `variableName` The name of the variable the robot uses
 * @arg {CognigyScript} `value` The value of the variable the robot uses, e.g. "input text"
 * @arg {CognigyScript} `injectText` The text the bot should send to the Flow when the robot is finished"
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 * @arg {CognigyScript} `store` Where to store the result
 */
async function RunRobot(input: IFlowInput, args: { secret: CognigySecret, robot: string, project: string, variableName: string, value: string, injectText: string, stopOnError: boolean, store: string }): Promise<IFlowInput | {}> {

    // Check if secret exists and contains correct parameters
    if (!args.secret || !args.secret.server || !args.secret.api_key) return Promise.reject("Secret not defined or invalid.");
    if (!args.robot) return Promise.reject("No robot name defined.");
    if (!args.injectText) return Promise.reject("No inject Text defined.");
    if (!args.project) return Promise.reject("No project defined.");
    if (!args.variableName) return Promise.reject("No variable defined.");
    if (!args.value) return Promise.reject("No input value for robot defined.");

    return new Promise((resolve, reject) => {

        const data = {
            "parameters":
                [
                    {
                        "variableName": args.variableName,
                        "attribute": [
                            {
                                "type": "text",
                                "name": args.variableName,
                                "value": args.value
                            }
                        ]
                    }
                ]
        };

        let robotRes;

        axios.post(`${args.secret.server}/rest/run/${args.project}/${args.robot}.robot`, data, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((robotResponse) => {
            robotRes = robotResponse;
            return sendInject(args.secret.api_key, input.input.userId, args.injectText, input.input.sessionId, (input.input as any).URLToken, input);
        }).then(() => {
            input.context.getFullContext()[args.store] = robotRes.data.values;
            resolve(input);
        }).catch((error) => {
            if (args.stopOnError) {
                reject(error.message); return;
            } else input.context.getFullContext()[args.store] = { "error": error.message };
            resolve(input);
        });

    });
}

module.exports.RunRobot = RunRobot;

const sendInject = (api_key, userId, text, sessionId, URLToken, input) => {

    const body = {
        userId,
        text,
        data: {},
        sessionId,
        URLToken
    };

    return axios.post('https://api-internal.cognigy.ai/endpoint/inject', body, {
        headers: {
            "X-API-Key": api_key,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then((res) => {
        // input.actions.log("info", JSON.stringify(res));
    }).catch((err) => {
        // input.actions.log("error", JSON.stringify(err));
        return;
    });
};