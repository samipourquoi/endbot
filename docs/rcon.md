# RCON

EndBot uses the RCON protocol to communicate to a Minecraft server. The protocol is used to send commands and receive the commands' responses.

## Why It Is Implemented Directly

There are a few reasons why EndBot implements its own functionality for RCON instead of using another developer's library:
- The library used in version four ([rcon-client][2]) did not handle multi-packet responses. This made \
   it impossible to get full responses back for a command, such as every player tracked on the \
   server scoreboards.
- The implementation allows for better control and abstraction within the code.
- No npm library currently accommodates all the desired features.

## How It Works

#### Connecting:

On initialization, the RCON will attempt to connect to the provided host and port. After receiving \
the connect event, it will then send an authentication packet that contains the RCON password. \
If the authentication succeeds, the RCON will be able to send commands to the server when needed.

#### Sending:

When sending a command to the server, the RCON will first create a packet and then add the \
request packet to a queue. The queue is then drained. This is done to ensure the bot does not lose \
connection with the Minecraft server if packets are sent in quick succession of one another \
(~100 ms; a problem with Minecraft). It also ensures the responses are matched with their \
respective requests.

#### Receiving:

When a response is received from the Minecraft server, the RCON will first check if there is a \
possibility that response can is split up into multiple packets. If the RCON determines the packet\
received is the entire length of the response, it will decode that packet and return the text to the \
user.

However, if the RCON thinks there is a chance the response is split into multiple packets, \
the process becomes a little more complicated.  In the RCON protocol, an empty string is attached \
to a packet at the end of its response. Unfortunately, Minecraft does not use this, so another way is \
needed to indicate the end of a response.

After the first response is received and the RCON determines it could be split into multiple packets, \
the RCON will send a dummy packet to the Minecraft server. Since the RCON protocol always \
sends response packets back in subsequent order, the previous response is finished once the \
dummy packet response is received. When this happens, all previous response packets are \
combined and the text from those packets is sent back to the user as one response.

## Other Resources

- **[Source RCON protocol][1]** - A wiki page that describes the RCON protocol in detail and contains examples of implementation for different languages
- **[node-rcon][3]** - A npm library with similar implementation
- **[rcon-client][2]** - Another npm library with similar implementation

**Written By: Syntro42**

[1]: https://developer.valvesoftware.com/wiki/Source_RCON_Protocol
[2]: https://github.com/janispritzkau/rcon-client
[3]: https://github.com/pushrax/node-rcon
