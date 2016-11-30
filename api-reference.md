#Session API Reference
All Requests must have Content-Type of "application/json"

##POST /session
Creates a refresh_token and access_token for a user session.

###Request Headers

<table>
    <tr>
        <th>Name</th>
        <th>Description</th>
    </tr>
    <tr>
    	<td>x-koms-clientid</td>
    	<td>The client id for the client application</td>
    </tr>
</table>

###Request Parameters