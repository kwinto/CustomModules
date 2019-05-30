import axios from 'axios';


/**
 * Lists all automations
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `contextStore` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */

async function listAutomations(input: any, args: { secret: CognigySecret, contextStore: string, stopOnError: boolean }): Promise<IFlowInput | {}> {

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

  const payload = {
    username,
    password
  };

  try {
    const authenticationResponse = await axios.post('https://fvvzacu1.ce.automationanywhere.digital/v1/authentication', payload);

    const token = authenticationResponse.data.token;
    const options = {
      headers: {
        'X-Authorization': token
      }
    };

    const fileListResponse = await axios.post('https://fvvzacu1.ce.automationanywhere.digital/v2/repository/file/list', {}, options);

    input.actions.addToContext(contextStore, fileListResponse.data, 'simple');
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

  const payload = {
    username,
    password
  };

  try {
    const authenticationResponse = await axios.post('https://fvvzacu1.ce.automationanywhere.digital/v1/authentication', payload);

    const token = authenticationResponse.data.token;
    const options = {
      headers: {
        'X-Authorization': token
      }
    };

    const fileListResponse = await axios.post('https://fvvzacu1.ce.automationanywhere.digital/v2/activity/list', {}, options);

    input.actions.addToContext(contextStore, fileListResponse.data, 'simple');
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

