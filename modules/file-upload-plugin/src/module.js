
/**
 * Prompts a webchat user to upload something to an S3 Bucket
 * @arg {SecretSelect} `secret` a secret with an AWS users access_key_id and secret_access_key
 * @arg {Select[v3,v4]} `signatureVersion` the signature version you want to use. (default v4) 
 * @arg {CognigyScript} `region` the endpoint region (default eu-central-1)
 * @arg {CognigyScript} `bucket` the name of the bucket (default bucket-name)
 * @arg {CognigyScript} `key` name of the bucket key (default uploaded-file)
 */
async function uploadToAWSBucket(cognigy, { 
    secret, 
    signatureVersion = 'v4',
    region = 'eu-central-1',
    bucket = 'bucket-name',
    key = 'uploaded-file'
}) {
    if (!secret)
        throw new Error('secret is not defined')

    const { access_key_id, secret_access_key } = secret;

    if (!access_key_id)
        throw new Error('access_key_id is not defined in selected secret');

    if (!secret_access_key)
        throw new Error('secret_access_key is not defined in selected secret');

    const S3 = require('aws-sdk/clients/s3');
    const s3Client = new S3();

    s3Client.config.update({
        accessKeyId: access_key_id,
        secretAccessKey: secret_access_key,
        signatureVersion,
        region
    });

    const uploadUrl = s3Client.getSignedUrl('putObject', {
        Bucket: bucket,
        Key: key
    });

    const downloadUrl = s3Client.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: key
    });

    cognigy.actions.output('', {
        _plugin: {
            type: 'file-upload',
            payload: {
                service: 'aws-s3',
                uploadUrl,
                downloadUrl
            }
        }
    });

    return cognigy;
}

module.exports = {
    uploadToAWSBucket
}