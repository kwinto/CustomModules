import axios from 'axios';

/**
 * Runs a robot
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `robot` The name of the robot you want to start, e.g. SearchHardware. Please don't add the prefix '.robot' to the name!
 * @arg {CognigyScript} `project` The name of the project where the robot is located
 * @arg {CognigyScript} `variableName` The name of the variable the robot uses
 * @arg {CognigyScript} `value` The value of the variable the robot uses, e.g. "input text"
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 * @arg {CognigyScript} `store` Where to store the result
 */
async function RunRobot(input: IFlowInput, args: { secret: CognigySecret, robot: string, project: string, variableName: string, value: string, stopOnError: boolean, store: string }): Promise<IFlowInput | {}> {

    // Check if secret exists and contains correct parameters
    if (!args.secret || !args.secret.server) return Promise.reject("Secret not defined or invalid.");
    if (!args.robot) return Promise.reject("No robot name defined.");

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

        axios.post(`${args.secret.server}/rest/run/${args.project}/${args.robot}.robot`, data, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            input.context.getFullContext()[args.store] = response.data.values;
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