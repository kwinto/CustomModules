const request = require('request-promise-native');
const uuid = require('uuid');

const { getToken, addQueueItem, getQueueItem } = require('./api');

/**
 * Describes the function
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `queueName` The queue that the payload should be send to (this will be added to the payload.)
 * @arg {CognigyScript} `resultQueueId` The id of the queue where the result message will be stored (looks for item.ResultId)
 * @arg {select[Low,Normal,High]} `priority` Select the priority of the queueItem
 * @arg {JSON} `specificContent` The JSON payload
 * @arg {CognigyScript} `timeOut` A timeout setting for waiting for the response
 * @arg {CognigyScript} `store` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function AddQueueItem(input, args) {
	try {
		// Check if secret exists and contains correct parameters  
		if (!args.secret) return Promise.reject("Secret not defined or invalid.");

		if (!args.queueName) return Promise.reject("No queue provided. Please provide a valid queue name.");

		if (!args.priority) return Promise.reject("Please select a priority.");

		// check if necessary arguments are present
		if (!args.specificContent) return Promise.reject("No payload provided.");

		const tokenResult = await getToken({
			client_id: args.secret.client_id,
			refresh_token: args.secret.refresh_token
		});

		const resultId = uuid.v4();

		const queueItem = {
			itemData: {
				Name: args.queueName,
				Priority: args.priority,
				SpecificContent: {
					...args.specificContent,
					ResultId: resultId,
					'ResultId@odata.type': '#String',
				}
			}
		};

		const addQueueItemResponse = await addQueueItem(queueItem, {
			access_token: tokenResult.access_token,
			account_logical_name: args.secret.account_logical_name,
			service_instance_logical_name: args.secret.service_instance_logical_name
		});

		input.context.getFullContext()[args.store] = addQueueItemResponse;

		return input;
	} catch (error) {
		if (args.stopOnError)
			throw error;

		input.context.getFullContext()[args.store] = error.message;
		return input;
	}
}

// You have to export the function, otherwise it is not available
module.exports.AddQueueItem = AddQueueItem;

/**
 * Polls for a queue item by OData filter
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `filter` The filter string
 * @arg {CognigyScript} `store` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function GetQueueItem(input, args) {
	try {
		if (!args.secret) 
			throw new Error('No secret defined');

		if (!args.filter)
			throw new Error('No filter defined');


		const tokenResult = await getToken({
			client_id: args.secret.client_id,
			refresh_token: args.secret.refresh_token
		});


		const queueItem = await (async () => {
			for (let polls = 0; polls < 15; polls++) {
				try {
					return await getQueueItem({
						filter: args.filter
					}, 
					{
						access_token: tokenResult.access_token,
						account_logical_name: args.secret.account_logical_name,
						service_instance_logical_name: args.secret.service_instance_logical_name
					});
				} catch (error) {
					console.log('Could not find item in return queue.')
				}

				await new Promise(r => setTimeout(r, 1000));
			}

			throw new Error('maximum polling retries reached!');
		})();

		input.context.getFullContext()[args.store] = queueItem;
		return input;
	} catch (error) {
		if (args.stopOnError)
			throw error;

		input.context.getFullContext()[args.store] = error.message;
		return input;
	}
}

module.exports.GetQueueItem = GetQueueItem;


/**
 * Describes the function
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `store` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function GetReleases(input, args) {
	// Check if secret exists and contains correct parameters  
	if (!args.secret) return Promise.reject("Secret not defined or invalid.");

	// Always return a Promise
	// A resolved Promise MUST return the input object
	// A rejected Promise will stop Flow execution and show an error in the UI, but not the channel
	return new Promise((resolve, reject) => {
		let result = {}
		let response;
		// if there is an error, handle it according to the best practice guide

		let accessToken;

		let options = {
			method: 'POST',
			uri: 'https://account.uipath.com/oauth/token',
			body: {
				grant_type: "refresh_token",
				//client_id: "5v7PmPJL6FOGu6RB8I1Y4adLBhIwovQN",
				//refresh_token: "0Km_486MqaJDo7WwBOuIEFIvaLsOhz9XhJ_1zCiTDf4i7"
				client_id: args.secret.client_id,
				refresh_token: args.secret.refresh_token
			},
			json: true // Automatically stringifies the body to JSON
		};

		request(options)
			.then(function (parsedBody) {
				response = parsedBody;
				accessToken = parsedBody.access_token;

				let finalOptions = {
					method: 'GET',
					url: `https://platform.uipath.com/${args.secret.account_logical_name}/${args.secret.service_instance_logical_name}/odata/Releases`,
					headers: {
						'Content-Type': 'application/json',
						'X-UIPATH-TenantName': args.secret.service_instance_logical_name
					},
					auth: {
						'bearer': accessToken
					},
					json: true
				};

				request(finalOptions)
					.then((jobs) => {

						input.context.getFullContext()[args.store] = jobs;
						resolve(input);

					})
					.catch((err) => {
						if (args.stopOnError) { reject(err); return; }
					})

				// res.send(accessToken)
			})
			.catch((err) => {
				if (args.stopOnError) { reject(err); return; }

			});

		// if not rejected before, write the result buffer to the Context or Input object

	});
}

// You have to export the function, otherwise it is not available
module.exports.GetReleases = GetReleases;



/**
 * Describes the function
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `store` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function GetJobs(input, args) {
	// Check if secret exists and contains correct parameters  
	if (!args.secret) return Promise.reject("Secret not defined or invalid.");

	// Always return a Promise
	// A resolved Promise MUST return the input object
	// A rejected Promise will stop Flow execution and show an error in the UI, but not the channel
	return new Promise((resolve, reject) => {
		let result = {}
		let response;
		// if there is an error, handle it according to the best practice guide

		let accessToken;

		let options = {
			method: 'POST',
			uri: 'https://account.uipath.com/oauth/token',
			body: {
				grant_type: "refresh_token",
				//client_id: "5v7PmPJL6FOGu6RB8I1Y4adLBhIwovQN",
				//refresh_token: "0Km_486MqaJDo7WwBOuIEFIvaLsOhz9XhJ_1zCiTDf4i7"
				client_id: args.secret.client_id,
				refresh_token: args.secret.refresh_token
			},
			json: true // Automatically stringifies the body to JSON
		};

		request(options)
			.then(function (parsedBody) {
				response = parsedBody;
				accessToken = parsedBody.access_token;

				let finalOptions = {
					method: 'GET',
					url: `https://platform.uipath.com/${args.secret.account_logical_name}/${args.secret.service_instance_logical_name}/odata/Jobs`,
					headers: {
						'Content-Type': 'application/json',
						'X-UIPATH-TenantName': args.secret.service_instance_logical_name
					},
					auth: {
						'bearer': accessToken
					},
					json: true
				};

				request(finalOptions)
					.then((jobs) => {

						input.context.getFullContext()[args.store] = jobs;
						resolve(input);

					})
					.catch((err) => {
						if (args.stopOnError) { reject(err); return; }
					})

				// res.send(accessToken)
			})
			.catch((err) => {
				if (args.stopOnError) { reject(err); return; }

			});

		// if not rejected before, write the result buffer to the Context or Input object

	});
}

// You have to export the function, otherwise it is not available
module.exports.GetJobs = GetJobs;





/**
 * Trigger a specific Job
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `releaseKey` The releaseKey. Use the GetReleases request to obtain the key. 
 * @arg {select[Specific,All]} `strategy` The job strategy
 * @arg {CognigyScript} `robotId` The ID of the Robot that needs to be triggered
 * @arg {JSON} `inputArguments` The JSON payload
 * @arg {CognigyScript} `store` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function StartJob(input, args) {
	// Check if secret exists and contains correct parameters  
	if (!args.secret) return Promise.reject("Secret not defined or invalid.");
	if (!args.releaseKey) return Promise.reject("Please provide a valid Release Key. Use the GetReleases operation to get a list of releases.");
	if (!args.robotId) return Promise.reject("Please provide a valid Robot ID.");
	if (!args.strategy) return Promise.reject("No Strategy specified. Please specify a Strategy.");

	// Always return a Promise
	// A resolved Promise MUST return the input object
	// A rejected Promise will stop Flow execution and show an error in the UI, but not the channel
	return new Promise((resolve, reject) => {
		let result = {}
		let response;
		// if there is an error, handle it according to the best practice guide

		let accessToken;

		let options = {
			method: 'POST',
			uri: 'https://account.uipath.com/oauth/token',
			body: {
				grant_type: "refresh_token",
				//client_id: "5v7PmPJL6FOGu6RB8I1Y4adLBhIwovQN",
				//refresh_token: "0Km_486MqaJDo7WwBOuIEFIvaLsOhz9XhJ_1zCiTDf4i7"
				client_id: args.secret.client_id,
				refresh_token: args.secret.refresh_token
			},
			json: true // Automatically stringifies the body to JSON
		};

		request(options)
			.then(function (parsedBody) {
				response = parsedBody;
				accessToken = parsedBody.access_token;

				let job = {
					"startInfo":
					{
						"ReleaseKey": args.releaseKey,
						"Strategy": args.strategy,
						"RobotIds": [Number.parseInt(args.robotId)],
						"NoOfRobots": 0,
						"Source": "Manual",
						"InputArguments": JSON.stringify(args.inputArguments)
					}
				}

				let finalOptions = {
					method: 'POST',
					url: `https://platform.uipath.com/${args.secret.account_logical_name}/${args.secret.service_instance_logical_name}/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs`,
					headers: {
						'Content-Type': 'application/json',
						'X-UIPATH-TenantName': args.secret.service_instance_logical_name
					},
					auth: {
						'bearer': accessToken
					},
					body: job,
					json: true
				};

				request(finalOptions)
					.then((result) => {

						input.context.getFullContext()[args.store] = result;
						resolve(input);

					})
					.catch((err) => {
						if (args.stopOnError) { reject(err); return; }
					})

				// res.send(accessToken)
			})
			.catch((err) => {
				if (args.stopOnError) { reject(err); return; }

			});

		// if not rejected before, write the result buffer to the Context or Input object

	});
}

// You have to export the function, otherwise it is not available
module.exports.StartJob = StartJob;



