# Google Maps
Integrated Cognigy.AI with Google Maps (https://developers.google.com/maps/documentation/)

This module is based on node-request-promise (https://www.npmjs.com/package/request-promise)

### Secret
This modules needs a CognigySecret to be defined and passed to the Nodes. The secret must have the following keys:

- **key**:  api_key
- **value**: Your Google Maps <API KEY>

**Properties**

There are two ways to use this Custom Module. Use the Google Maps Geocoding API to get the longitude and latitude of the address. 
    Such as the [documentation](https://developers.google.com/maps/documentation/geocoding/start) says, you can add the properties as a simple string: 

    - address
If the Searchquery field is empty or no Place was found, it use the default values from Latitude and Longitude. 
The fields look like this:
![Create Location Node](./docs/google-maps-node.png)

**View**
In combination with the google-maps Webchat Plugin you get this view:
![Create Location Node](./docs/google-maps-Webchat.png)