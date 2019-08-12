import { Client } from "@microsoft/microsoft-graph-client";

/**
 * Get the user details.
 * @arg {CognigyScript} `accessToken` The text to analyse
 * @arg {Select[me,all]} `userSource` The user information source
 * @arg {CognigyScript} `contextStore` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function getUserDetails(input: IFlowInput, args: { accessToken: string, userSource: string, contextStore: string, stopOnError: boolean }): Promise<IFlowInput | {}> {
    // Check parameters
    const { accessToken, userSource, contextStore, stopOnError } = args;
    if (!accessToken) return Promise.reject("No access token defined. Please use the Azure Custom Module for authenticating the user.");
    if (!userSource) return Promise.reject("No user source defined. If you want to get your own information, use 'me', otherwise get the information of all users by selecting 'all'.");
    if (!contextStore) return Promise.reject("No context store key defined.");
    if (stopOnError === undefined) throw new Error("Stop on error flag not defined.");

    try {
        const client: Client = getAuthenticatedClient(accessToken);
        let path: string = "";

        if (userSource === "me") path = "me";
        else if (userSource === "users") path = "all";

        const user = await client.api(`/${path}`).get();

        input.actions.addToContext(contextStore, user, 'simple');
    } catch (error) {
        if (stopOnError) {
            throw new Error(error.message);
        } else {
            input.actions.addToContext(contextStore, { error: error.message }, 'simple');
        }
    }

    return input;
}

module.exports.getUserDetails = getUserDetails;

/**
 * Send a mail with the logged in user.
 * @arg {CognigyScript} `accessToken` The text to analyse
 * @arg {CognigyScriptArray} `recipients` The recipients of the sent mail
 * @arg {CognigyScript} `subject` The mail's subject
 * @arg {CognigyScript} `content` The mail's content
 * @arg {Select[html,text]} `contentType` The type of the mail's text
 * @arg {CognigyScript} `contextStore` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function sendMail(input: IFlowInput, args: { accessToken: string, recipients: string[], subject: string, content: string, contentType: string, contextStore: string, stopOnError: boolean }): Promise<IFlowInput | {}> {
    // Check parameters
    const { accessToken, recipients, subject, content, contentType, contextStore, stopOnError } = args;
    if (!accessToken) return Promise.reject("No access token defined. Please use the Azure Custom Module for authenticating the user.");
    if (!recipients) return Promise.reject("No email recipients defined.");
    if (!subject) return Promise.reject("No email subject defined.");
    if (!content) return Promise.reject("No email content defined.");
    if (!contentType) return Promise.reject("No email content type defined.");
    if (!contextStore) return Promise.reject("No  defined.");
    if (stopOnError === undefined) throw new Error("Stop on error flag not defined.");

    try {
        const client = getAuthenticatedClient(accessToken);

        // Construct email object
        const mail = {
            subject,
            toRecipients: [
                {
                    emailAddress: {
                        address: recipients[0],
                    },
                },
            ],
            body: {
                content,
                contentType,
            },
        };
        try {
            const response = await client.api("/me/sendMail").post({ message: mail });

            input.actions.addToContext(contextStore, response, 'simple');
        } catch (error) {
            if (stopOnError) {
                throw new Error(error.message);
            } else {
                input.actions.addToContext(contextStore, { error: error.message }, 'simple');
            }
        }

    } catch (error) {
        if (stopOnError) {
            throw new Error(error.message);
        } else {
            input.actions.addToContext(contextStore, { error: error.message }, 'simple');
        }
    }

    return input;
}

module.exports.sendMail = sendMail;

function getAuthenticatedClient(accessToken: string): Client {
    // Initialize Graph client
    const client = Client.init({
        // Use the provided access token to authenticate requests
        authProvider: (done: any) => {
            done(null, accessToken);
        }
    });

    return client;
}