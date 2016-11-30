#Session API Reference
All Requests must have Content-Type of "application/json"

##POST /session
Creates a refresh_token and access_token for a user session.

####Request Headers

| Name  | Description |
| ------------- | ------------- |
| x-koms-clientid  | The client id for the client application  |

####Request Parameters

| Name  | Type | Description |
| ------------- | ------------- | ------------- |
| account_type | String | The type of account that needs a session. "traditional" is the only type currently supported. |
| email | String | user's email address |
| password | String | user's password |

####Response Type
```
Struct {
    access_token: string,
    refresh_token: string,
    access_token_expires_in: unsigned int32
}
```