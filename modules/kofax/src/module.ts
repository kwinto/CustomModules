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

    const body = {
        userId: input.user.userId,
        text: "hi",
        data: {},
        sessionId: input.user.sessionId,
        URLToken: "5fc6cecf484aae8556645b21864ebf3f4cb8926534bed17e6aecfbb9c83ab7a5"
    };

    return new Promise( (resolve, reject) => {

        axios.post('https://api-internal.cognigy.ai/endpoint/inject', body, {
            headers: {
                "X-API-Key": "2b488aa4d112c554159de1b03ebf0040",
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        }).then((res) => {
            input.actions.output("RESPONSE", null);
            input.actions.log("error", JSON.stringify(res));
            resolve(input);
        }).catch((err) => {
            input.actions.output("ERROOOR", null);
            input.actions.log("error", JSON.stringify(err));
            resolve(input);
        });

        // sendInject(args.secret.api_key, input.user.userId, "hi", input.user.sessionId, "5fc6cecf484aae8556645b21864ebf3f4cb8926534bed17e6aecfbb9c83ab7a5", input);

        // const data = {
        //     "parameters":
        //         [
        //             {
        //                 "variableName": args.variableName,
        //                 "attribute": [
        //                     {
        //                         "type": "text",
        //                         "name": args.variableName,
        //                         "value": args.value
        //                     }
        //                 ]
        //             }
        //         ]
        // };

        // axios.post(`${args.secret.server}/rest/run/${args.project}/${args.robot}.robot`, data, {
        //     headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json'
        //     }
        // }).then((response) => {
        //     sendInject(args.secret.api_key, input.user.userId, "hi", input.user.sessionId, "5fc6cecf484aae8556645b21864ebf3f4cb8926534bed17e6aecfbb9c83ab7a5");
        //     input.context.getFullContext()[args.store] = response.data.values;
        //     resolve(input);
        // }).catch((error) => {
        //     if (args.stopOnError) {
        //         reject(error.message); return;
        //     } else input.context.getFullContext()[args.store] = { "error": error.message };
        //     resolve(input);
        // });

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

    return axios.post('https://api-internal.cognigy.ai/inject', body, {
        headers: {
            "X-API-Key": api_key,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then((res) => {
        input.actions.log("error", JSON.stringify(res));
    }).catch((err) => {
        input.actions.log("error", JSON.stringify(err));
        return;
    });
};