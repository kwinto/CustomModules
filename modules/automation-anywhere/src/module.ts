import axios from 'axios';


/**
 * Lists all automations
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `summary` The summary of the new ticket
 * @arg {CognigyScript} `store` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */

async function listAutomations(input: any, args: { secret: CognigySecret, store: string, stopOnError: boolean }): Promise<IFlowInput | {}> {

  if (!args.secret || !args.secret.username || !args.secret.password || !args.secret.url) return Promise.reject("Secret not defined or invalid.");
  // if (!args.summary) return Promise.reject("No ticket sumnmary defined");

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

        input.context.getFullContext()[args.store] = fileListResponse.data;

        resolve(input);
      })
      .catch(((error) => {
        input.context.getFullContext()[args.store] = { "error": error.message };
        resolve(input);
      })
    );
  });
}
module.exports.listAutomations = listAutomations;
