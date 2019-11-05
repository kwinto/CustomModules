/**
 * Custom Node to change the bot's avatar image.
 * @arg {CognigyScript} `avatarUrl` The URL of your bot's avatar. It has to be a public link to the actual image.
 * @arg {CognigyScript} `contextStore` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */

async function changeBotAvatar(input: any, args: { avatarUrl: string, contextStore: string, stopOnError: boolean }): Promise<IFlowInput | {}> {

  const { avatarUrl, contextStore, stopOnError } = args;
  if (!avatarUrl) throw new Error('No avatar url defined. You need this to change the avatar image of the bot');
  if (!contextStore) throw new Error('No context store defined.');

  try {
    input.actions.output("", {
      "_webchat": {
        "botAvatarOverrideUrl": avatarUrl
      }
    });

    input.actions.addToContext(contextStore, `Avatar was changed succesfully to ${avatarUrl}`, 'simple');
  } catch (error) {
    if (stopOnError) {
      throw new Error(error.message);
    } else {
      input.actions.addToContext(contextStore, { error: error.message}, 'simple');
    }
  }

  return input;
}
module.exports.changeBotAvatar = changeBotAvatar;