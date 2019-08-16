
const LanguageDetect = require('languagedetect');
/**
 * Detects the language of the input
 * @arg {CognigyScript} `store` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function detectlanguage(input: IFlowInput, args: { writeToContext: boolean, store: string, stopOnError: boolean }): Promise<any> {

	// Always return a Promise
	// A resolved Promise MUST return the input object
	// A rejected Promise will stop Flow execution and show an error in the UI, but not the channel
	return new Promise((resolve, reject) => {


		try {
			const lngDetector = new LanguageDetect();
			// const language = lngDetector.detect('Es schaut so aus als ob ich das kenne.');
			const language = lngDetector.detect(input.input.text);
			input.context.getFullContext()[args.store] = language;
			resolve(input);
		} catch (e) {
			if (args.stopOnError) { reject(e.message); return; }
			const result = { "error": e.message };
			input.context.getFullContext()[args.store] = result;
			resolve(input);
		}
	});
}

// You have to export the function, otherwise it is not available
module.exports.detectlanguage = detectlanguage;

// const context = {}

// const cognigy = {
// 	input: {
// 		text: 'hi my name is robin'
// 	},
// 	context: {
// 		getFullContext: () => context
// 	}
// };

// const args = {
// 	writeToContext: true,
// 	stopOnError: true,
// 	store: 'result'
// }

// detectlanguage(cognigy, args)
// 	.then(() => {
// 		console.log(cognigy, context);
// 	})

