
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
            service: 'amazon-s3',
            uploadUrl,
            downloadUrl
        }
    });

    return cognigy;
}

/**Upload to Azure module */

/**
 * Prompts a webchat user to upload something to a Azure blob container
 * @arg {String} `accountStorageName` the name of the Azure Storage account that will be use to upload the file
 * @arg {CognigyScript} `containerName` the name of the container, if the name is not given then use a random name ()
 * @arg {SecretSelect} `secret` a secret with an Azure user's secret_access_key
 */
async function uploadToAzureContainer(cognigy, {
    secret,
    accountStorageName,
    containerName
}) {


    const {
        Aborter,
        AccountSASPermissions,
        AccountSASResourceTypes,
        AccountSASServices,
        SASProtocol,
        generateAccountSASQueryParameters,
        ServiceURL,
        SharedKeyCredential,
        StorageURL,
        ContainerURL,
    } = require('@azure/storage-blob');
    
    const uuidv1 = require('uuid/v1');

    const randomName = uuidv1();

    if (!containerName) {
        containerName = randomName;
    }

    const { secret_access_key } = secret;

    /**Create Azure blob service object */
    function getBlobServiceUrl() {
        const credentials = new SharedKeyCredential(
            accountStorageName,
            secret_access_key
        );
        const pipeline = StorageURL.newPipeline(credentials);
        const blobPrimaryURL = `https://${accountStorageName}.blob.core.windows.net/`;
        return new ServiceURL(blobPrimaryURL, pipeline);
    }

    const serviceURL = getBlobServiceUrl();


    /**Create a new container from the given name, if name was not given, the container name will be the date it was created */


    const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);

    async function createContainer() {
        try {

            await containerURL.create(Aborter.none);

        } catch (error) {
            return error;
        }
    }

    await createContainer();

    /**SasURL Expiration time */

    const now = new Date();
    now.setMinutes(now.getMinutes() - 5);

    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);

    // By default, credential is always the last element of pipeline factories
    const factories = serviceURL.pipeline.factories;
    const sharedKeyCredential = factories[factories.length - 1];

    /**Create a sasToken */

    const sasToken = generateAccountSASQueryParameters(
        {
            expiryTime: tmr,
            ipRange: { start: '0.0.0.0', end: '255.255.255.255' },
            permissions: AccountSASPermissions.parse('rwdlacup').toString(),
            protocol: SASProtocol.HTTPSandHTTP,
            resourceTypes: AccountSASResourceTypes.parse('sco').toString(),
            services: AccountSASServices.parse('b').toString(),
            startTime: now,
            version: '2019-02-02',
        },
        sharedKeyCredential
    ).toString();

    const baseURL = serviceURL.url;
    const sasSignature = `?${sasToken}`

    cognigy.actions.output('', {
        _plugin: {
            type: 'file-upload',
            service: 'azure',
            baseURL,
            sasSignature,
            containerName,
        }
    });

    return cognigy;
}

module.exports = {
    uploadToAWSBucket,
    uploadToAzureContainer
}