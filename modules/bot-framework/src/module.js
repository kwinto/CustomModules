const botbuilder = require('botbuilder');

/**
 * Gets the authentication acces token from Microsoft
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `redirectUri` The url which should be triggered after user is logged in with microsoft
 * @arg {CognigyScript} `scope` For example user.read
 * @arg {CognigyScript} `authCode` The microsoft auth code, your call back url stored
 * @arg {CognigyScript} `contextStore` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function getAuthenticationTokenWithADAL(input, args) {

    
    return input;
}

module.exports.getAuthenticationTokenWithADAL = getAuthenticationTokenWithADAL;