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


  return new Promise((resolve, reject) => {

    const username = args.secret.username;
    const password = args.secret.password;
    const url = args.secret.url;

    const payload = {
      username,
      password
    };

    // input.actions.output(JSON.stringify(payload));

    // Get token
    axios.post('https://fvvzacu1.ce.automationanywhere.digital/v1/authentication', payload)
      .then((authenticationResponse) => {
        // input.actions.output('auth')
        const token = authenticationResponse.data.token;

        const options = {
          headers: {
            'X-Authorization': token
          }
        };

        // input.actions.output(JSON.stringify(options));

        return axios.post('https://fvvzacu1.ce.automationanywhere.digital/v2/repository/file/list', {}, options);
      })
      .then((fileListResponse) => {
        // input.actions.output('filelist')

        input.context.getFullContext()[args.contextStore] = fileListResponse.data;

        resolve(input);
      })
      .catch(((error) => {
        input.context.getFullContext()[args.contextStore] = { "error": error.message };
        resolve(input);
      })
      );
  });
}
module.exports.listAutomations = listAutomations;
