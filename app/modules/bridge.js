export class BridgeModule {
    constructor() {
        
    }

    /**
     * post request
     * @param {string} idToken - The ID token for authorization.
     * @param {string} location - The endpoint URL to send the request to.
     * @param {object} data - The data to include in the request body.
     * @returns {Promise<object>} - The response data as a JSON object.
     */
    async post(idToken, location, data) {
        try {
            var result = await fetch(location, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${idToken}`,
                },
                mode: 'cors',
                cache: 'default',
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(async response => {
                return response;
            });

            return result;
        } catch (error) {
            console.log("Error from bridge: ", error);
        }
    }
}
