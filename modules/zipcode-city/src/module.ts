/**
 * Reads zipcode_germany out from keyphrases and if any returns City/State for that zipcode
 * @arg {Boolean} `writeToContext` Whether to write to Cognigy Context (true) or Input (false)
 * @arg {CognigyScript} `store` Where to store the result
 */
async function zipcodeToCity(
	input: IFlowInput,
	args: {
		writeToContext: boolean;
		store: string;
		stopOnNothingFound: boolean;
	},
): Promise<IFlowInput | {}> {
	return new Promise((resolve, reject) => {
		let result = {};
		const data = require("./data.de.json");

		if (input.input?.keyphrases?.zipcode_germany) {
			const zipcode = Number(input.input.keyphrases["zipcode_germany"][0].keyphrase);
			const city = data.find(city => city.Plz === zipcode);

			if (city) {
				result = {
					city: city.Ort,
					city_addon: city.Zusatz,
					state: city.Bundesland,
				};
			}
		}

		if (args.writeToContext) {
			input.context.setContext(args.store, result);
		} else {
			input.input[args.store] = result;
		}

		resolve(input);
	});
}

module.exports.zipcodeToCity = zipcodeToCity;
