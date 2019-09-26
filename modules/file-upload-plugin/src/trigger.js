const { uploadToAWSBucket } = require('./module');
 
const cognigyMock = {
    actions: {
        output: console.log.bind(console)
    }
}

uploadToAWSBucket(cognigyMock, {
    json: ''
});

