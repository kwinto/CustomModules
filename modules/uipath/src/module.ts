var rp = require('request-promise');


/**
 * Describes the function
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `queueName` The queue that the payload should be send to (this will be added to the payload.)
 * @arg {CognigyScript} `returnQueueDefinitionID` The queue that Cognigy should listen to for any return items.
 * @arg {select[Low,Normal,High]} `priority` Select the priority of the queueItem
 * @arg {JSON} `specificContent` The JSON payload
 * @arg {CognigyScript} `timeOut` A timeout setting for waiting for the response
 * @arg {CognigyScript} `store` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function AddQueueItem(input: IFlowInput, args: { secret: CognigySecret, queueName: string, returnQueueDefinitionID:string, priority:string, specificContent: JSON, store: string, timeOut: number, stopOnError: boolean }): Promise<IFlowInput | {}> {
	// Check if secret exists and contains correct parameters  
	if (!args.secret) return Promise.reject("Secret not defined or invalid.");

	if (!args.queueName) return Promise.reject("No queue provided. Please provide a valid queue name.");

	if (!args.priority) return Promise.reject("Please select a priority.");

	// check if necessary arguments are present
	if (!args.specificContent) return Promise.reject("No payload provided.");

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

		let queueItem = {
			"itemData": {
			  "Name": args.queueName,
			  "Priority": args.priority,
			  "SpecificContent": args.specificContent
			}
		  }

		rp(options)
        .then(function (parsedBody) {
            response = parsedBody;
            accessToken = parsedBody.access_token;

			
            let finalOptions = {
				method: 'POST',
				url: `https://platform.uipath.com/${args.secret.account_logical_name}/${args.secret.service_instance_logical_name}/odata/Queues/UiPathODataSvc.AddQueueItem`,	
                //url: `https://platform.uipath.com/cognigy/MyService09xh117935/odata/Queues/UiPathODataSvc.AddQueueItem`,
                headers: {
                    'Content-Type': 'application/json',
                    'X-UIPATH-TenantName': args.secret.service_instance_logical_name
                },
                auth: {
                    'bearer': accessToken
                },
                body: queueItem,
                json: true
            };

            rp(finalOptions)
            .then((parsedBody) => { 

				// input.context.getFullContext()[args.store] = parsedBody;
			 	// resolve(input);
				let pollingRequestOptions = {
					method: 'GET',
					url: 'https://platform.uipath.com/cognigy/MyService09xh117935/odata/QueueItems',
					headers: {
						'Content-Type': 'application/json',
						'X-UIPATH-TenantName': args.secret.service_instance_logical_name
					},
					auth: {
						'bearer': accessToken
					},
					qs: {
						'$filter': `QueueDefinitionId eq ${args.returnQueueDefinitionID}`,
						'$top': '1'
					},
					json: true
				};
				
				if(args.returnQueueDefinitionID !== null && args.returnQueueDefinitionID !== undefined) {
					setTimeout(function() {
						rp(pollingRequestOptions)
						.then((response)=> {
							
							input.context.getFullContext()[args.store] = response;
							resolve(input);
						})
					}, args.timeOut);
				} else {	
					input.context.getFullContext()[args.store] = parsedBody;
					resolve(input);
				}
            })
            .catch((err)=> {
				if (args.stopOnError) { reject(err); return; }
				else  input.context.getFullContext()[args.store] = err;
				resolve(input);
            })

            // res.send(accessToken)
        })
        .catch(function (err) {
			if (args.stopOnError) { reject(err); return; }

        });

		// if not rejected before, write the result buffer to the Context or Input object
		
	});
}

// You have to export the function, otherwise it is not available
module.exports.AddQueueItem = AddQueueItem;

/**
 * Describes the function
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `store` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function GetReleases(input: IFlowInput, args: { secret: CognigySecret, store: string, stopOnError: boolean }): Promise<IFlowInput | {}> {
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

		rp(options)
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

            rp(finalOptions)
            .then((jobs) => { 

				input.context.getFullContext()[args.store] = jobs;
				resolve(input);
				
            })
            .catch((err)=> {
				if (args.stopOnError) { reject(err); return; }
            })

            // res.send(accessToken)
        })
        .catch( (err)=> {
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
async function GetJobs(input: IFlowInput, args: { secret: CognigySecret, store: string, stopOnError: boolean }): Promise<IFlowInput | {}> {
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

		rp(options)
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

            rp(finalOptions)
            .then((jobs) => { 

				input.context.getFullContext()[args.store] = jobs;
				resolve(input);
				
            })
            .catch((err)=> {
				if (args.stopOnError) { reject(err); return; }
            })

            // res.send(accessToken)
        })
        .catch( (err)=> {
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
async function StartJob(input: IFlowInput, 
	args: { secret: CognigySecret, releaseKey: string, strategy: string, robotId: string, inputArguments: JSON, store: string, stopOnError: boolean }): Promise<IFlowInput | {}> {
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

		rp(options)
        .then(function (parsedBody) {
            response = parsedBody;
			accessToken = parsedBody.access_token;
			
			let job = { "startInfo":
						{ 
						"ReleaseKey": args.releaseKey,
						"Strategy": args.strategy,
						"RobotIds": [ Number.parseInt(args.robotId) ],
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

            rp(finalOptions)
            .then((result) => { 

				input.context.getFullContext()[args.store] = result;
				resolve(input);
				
            })
            .catch((err)=> {
				if (args.stopOnError) { reject(err); return; }
            })

            // res.send(accessToken)
        })
        .catch( (err)=> {
			if (args.stopOnError) { reject(err); return; }

        });

		// if not rejected before, write the result buffer to the Context or Input object
		
	});
}

// You have to export the function, otherwise it is not available
module.exports.StartJob = StartJob;



