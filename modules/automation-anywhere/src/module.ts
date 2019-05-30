import axios from 'axios';


/**
 * Lists all automations
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `contextStore` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */

async function listAutomations(input: any, args: { secret: CognigySecret, contextStore: string, stopOnError: boolean }): Promise<IFlowInput | {}> {

  const { contextStore, stopOnError, username, password, url } = validateArgs(args);

  try {
    const options = await authenticate(input, username, password, contextStore, stopOnError);
    const response = await axios.post('https://fvvzacu1.ce.automationanywhere.digital/v2/repository/file/list', {}, options);

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
module.exports.listAutomations = listAutomations;


/**
 * Lists all acitivies
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `contextStore` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */

async function listActivities(input: any, args: { secret: CognigySecret, contextStore: string, stopOnError: boolean }): Promise<IFlowInput | {}> {

  const { contextStore, stopOnError, username, password, url } = validateArgs(args);

  try {
    const options = await authenticate(input, username, password, contextStore, stopOnError);
    const response = await axios.post('https://fvvzacu1.ce.automationanywhere.digital/v2/activity/list', {}, options);

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
module.exports.listActivities = listActivities;


async function authenticate(input: any, username: string, password: string, contextStore: string, stopOnError: boolean): Promise<object> {

  let options = {};

  const payload = {
    username,
    password
  };

  try {
    const authenticationResponse = await axios.post('https://fvvzacu1.ce.automationanywhere.digital/v1/authentication', payload);
    const token = authenticationResponse.data.token;

    options = {
      headers: {
        'X-Authorization': token
      }
    };

  } catch (error) {
    if (stopOnError) {
      throw new Error(error.message);
    } else {
      input.actions.addToContext(contextStore, { error: error.message }, 'simple');
    }
  }

  return options;
}

interface IValidateArgsResponse {
  contextStore: string;
  stopOnError: boolean;
  username: string;
  password: string;
  url: string;
}

function validateArgs(args: { secret: CognigySecret, contextStore: string, stopOnError: boolean }): IValidateArgsResponse {

  /* validate node arguments */
  const { secret, contextStore, stopOnError } = args;
  if (!secret) throw new Error("Secret not defined.");
  if (!contextStore) throw new Error("Context store not defined.");
  if (stopOnError === undefined) throw new Error("Stop on error flag not defined.");

  /* validate secrets */
  const { username, url, password } = secret;
  if (!username) throw new Error("Secret is missing the 'username' field.");
  if (!url) throw new Error("Secret is missing the 'username' url.");
  if (!password) throw new Error("Secret is missing the 'password' field.");

  return {
    contextStore,
    stopOnError,
    username,
    password,
    url
  };
}
