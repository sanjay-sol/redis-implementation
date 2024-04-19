# Redis Implementation Project

This project is a Redis-like implementation written in TypeScript, aiming to provide basic Redis functionalities such as string operations, list operations, set operations, and pub/sub messaging, along with the addition of Streams functionality.

## Features

### String Operations
- **SET**: Set the value of a key.
- **GET**: Get the value of a key.
- **MGET**: Get the values of multiple keys.
- **SETNX**: Set the value of a key only if it does not exist.

### List Operations
- **LPUSH**: Insert one or multiple values at the beginning of a list.
- **RPUSH**: Insert one or multiple values at the end of a list.
- **LPOP**: Remove and get the first element in a list.
- **RPOP**: Remove and get the last element in a list.
- **LRANGE**: Get a range of elements from a list.
- **LLEN**: Get the length of a list.
- **BRPOP**: Remove and get the last element in a list, or block until one is available.
- **BLPOP**: Remove and get the first element in a list, or block until one is available.

### Set Operations
- **SADD**: Add one or more members to a set.
- **SREM**: Remove one or more members from a set.
- **SISMEMBER**: Determine if a given value is a member of a set.
- **SINTER**: Intersect multiple sets and return the result.

### Pub/Sub Messaging
- **SUBSCRIBE**: Subscribe to one or more channels.
- **PUBLISH**: Publish a message to a channel.
- **PSUBSCRIBE**: Subscribe to one or more channel patterns.
- **UNSUBSCRIBE**: Unsubscribe from one or more channels or patterns.

### Streams
- **XADD**: Append a new element to a stream.
- **XREAD**: Read data from one or more streams.

## Usage

### 1. Clone the repository and move into the directory:

```bash
git clone https://github.com/sanjay-sol/redis

cd redis
```
### 2. Install dependencies:
``` bash
npm install
```
### 3. Start the server:
```
npm start
```
### 4. Connect to the server using a Redis client or use the CLI:
```
 redis-cli -p 8000 
 ```

### 5. Start using Redis commands, e.g.:
```
127.0.0.1:8000 > SET mykey "Hello"
127.0.0.1:8000 > GET mykey
127.0.0.1:8000 > LPUSH mylist "world"
127.0.0.1:8000 > LRANGE mylist 0 -1
```

## Contributing
Contributions are welcome! If you have any suggestions or find any issues, please open an issue or create a pull request.
