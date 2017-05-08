# Session API Reference
All Requests must have Content-Type of "application/json"

## POST /session
Create a refresh_token and access_token for a user session.

#### Request Headers

| Name  | Description |
| ------------- | ------------- |
| x-koms-clientid  | The client id for the client application  |

#### Request Parameters

| Name  | Type | Description |
| ------------- | ------------- | ------------- |
| account_type | String | The type of account that needs a session. "traditional" is the only type currently supported. |
| email | String | user's email address |
| password | String | user's password |

#### Response Type
```
Struct {
    access_token: string,
    refresh_token: string,
    access_token_expires_in: unsigned int32
}
```

## PUT /session
Refresh an expired access_token.

#### Request Headers

| Name  | Description |
| ------------- | ------------- |
| x-koms-clientid  | The client id for the client application  |
| Authorization | Value must be "Bearer {access_token}" - this must be the most recent access_token issued by the service. |

#### Request Parameters

| Name  | Type | Description |
| ------------- | ------------- | ------------- |
| refresh_token | String | A valid refresh token returned as a response to either a POST or PUT operation. |

#### Response Type
```
Struct {
    access_token: string,
    refresh_token: string,
    access_token_expires_in: unsigned int32
}
```

## GET /session
Return the amount of time left before an access_token expires.

#### Request Headers

| Name  | Description |
| ------------- | ------------- |
| x-koms-clientid  | The client id for the client application  |
| Authorization | Value must be "Bearer {access_token}" - this must be the most recent access_token issued by the service. |

#### Response Type
```
Struct {
    access_token_expires_in: unsigned int32
}
```

## DELETE /session
End the session. All subsequent access token or refresh token usage from the completed session will return a 401 status. A new session must be created with a POST /session call.

#### Request Headers

| Name  | Description |
| ------------- | ------------- |
| x-koms-clientid  | The client id for the client application  |
| Authorization | Value must be "Bearer {access_token}" - this must be the most recent access_token issued by the service. |

## POST /user
Create a new user with a "traditional" account type.

#### Request Headers

| Name  | Description |
| ------------- | ------------- |
| x-koms-clientid  | The client id for the client application  |

#### Request Parameters

| Name  | Type | Description |
| ------------- | ------------- | ------------- |
| email | String | user's email address |
| password | String | user's password |

#### Response Type
```
Struct {
    message: string
}
```

## GET /user
Return email and id for authenticated user.

#### Request Headers

| Name  | Description |
| ------------- | ------------- |
| x-koms-clientid  | The client id for the client application  |
| Authorization | Value must be "Bearer {access_token}" - this must be the most recent access_token issued by the service. |

#### Response Type
```
Struct {
    id: string,
    email: string
}
```
