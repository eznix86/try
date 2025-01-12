# Try

![Bundle size](https://deno.bundlejs.com/badge?q=@eznix/try&treeshake=[*])

## Concept

This package aims to simulate an approach where errors are treated as values, similar to programming languages like [Rust](https://doc.rust-lang.org/rust-by-example/error.html) and [Golang](https://go.dev/blog/error-handling-and-go), where errors are explicit.

Check also [Railway Oriented Programming](https://swlaschin.gitbooks.io/fsharpforfunandprofit/content/posts/recipe-part2.html).

In Rust, using the Result Pattern:

```rust
fn main() {
    let result = File::open("hello.txt");

    let greeting_file = match result {
        Ok(file) => file,
        Err(error) => // handle errors,
    };
}
```

In Golang, errors are implicit:

```go
f, err := os.Open("filename.ext")
if err != nil {
  // handle errors
}
```

## Why?

Errors are not explicit in Javascript. Importing an external library or using your own code can introduce errors that can be difficult to track down. So your code is based on trust alone.

```js
import { fetchUser } from "./user";
import { leftpad } from "leftpad";

await fetchUser(); // should we handle the errors ?
leftpad(); // should we handle the errors ?
```

Try is a wrapper for your functions. It enforces the need to handle errors and errors is not thrown, they are returned as values. The library also aims to eliminate callback hell (nested then) and the tower of doom (try-catch block).

By treating errors as values, the project simplifies error handling, making it more explicit and reducing the chances of overlooking errors.

> [!NOTE]
> We also support synchronous function too. Use `trySync`, it will return no promise.

## Getting Started

```bash
bun add @eznix/try
yarn install @eznix/try
pnpm add @eznix/try
npm install @eznix/try
```

Don't forget to star it if you like the [project](https://github.com/eznix86/try).

## Wrapping Operations

```js
import { trySync, tryAsync } from "@eznix/try";

// `fetchUser` is an async function
const tryFetchUser = await tryAsync(fetchUser);
// `fetchUser` is an sync function
const tryFetchUser = trySync(fetchUser);

```

## Handling Results

### Access Successful Value

```js
const user = await tryFetchUser.getOrElse({"id": 1, "name": "jimmy"}); // Use a default value if the operation failed
```

### Inspect Error

```js
const error = await tryFetchUser.error(); // Get the error if the operation failed
```

### Recover from Failure

```js
// Compared to `getOrElse()`, you can try other actions, like another fetch.
// It will return errors as a value.
const recoveredTry = await tryFetchUser.recover((error) => defaultUser);
```

### Unwrap Result (Carefully)

```js
const result = await tryFetchUser.result();
console.log(result.isOk()); // true
console.log(result.isErr()); // false
console.log(result.unwrap());
```

## Examples

Examples of using `tryAsync`.

### Basic

```js
// Wrapping a potentially failing asynchronous operation
// Like network failure or a bad response from the server
const fetchUser = async (id: number): Promise<User> => {
    const response = await fetch(`/api/users/${id}`);
    const user = await response.json();
    return user;
};

const tryFetchUser = await tryAsync(fetchUser(123));

// Handling the result:
const user = await tryFetchUser.getOrElse({"id": 1, "name": "Jimmy"});
console.log("User: ", user.name);
// User: Jimmy
```

### All features

```js
// Example Usage:
(async () => {
    // Trying an asynchronous operation using `tryAsync`
    let failFn = await tryAsync<number, any>(async () => {
        throw new Error('Failed');
    });

    let fn = await tryAsync<{name: string}, any>(async () => {
        return {name: 'John'};
    });

    // Getting the result value or a default if there is an error
    let value: {name: string} = await fn.getOrElse({name: 'Default'});
    console.log('Value:', value); // {name: 'John'}

    // Getting the error, if any
    let error = await failFn.error();
    console.log('Error:', error); // Error: Failed

    // Getting both errors and data in a single Promise
    let { error: errors, data } = await fn.toPromise();
    console.log('Errors:', errors); // null
    console.log('Data:', data); // {name: 'John'}

    // Recovering from errors by providing a fallback value
    let recoveredTry = await failFn.recover((error) => 
    // perform another network call
    {name: "Recover"}
    );
    console.log('RecoveredTry:', recoveredTry); // Promise<Try<number, {name: string}>>

    let { data: recovered } = await recoveredTry.toPromise();
    console.log('Recovered:', recovered); // 100

    // Getting the result in a structured way
    let resultPattern = await fn.result();

    // Handling the result using the Result class
    if (resultPattern.isOk() && !resultPattern.isNull()) {
        console.log("ResultPattern", resultPattern.unwrap()); // {name: 'John'}
    } else {
        console.log("ResultPattern", resultPattern.unwrapErr()); // null
    }

    // Alternatively, you can use isErr()
    if (resultPattern.isErr()) {
        console.log("ResultPattern", resultPattern.unwrapErr()); // null
    } else {
        console.log("ResultPattern", resultPattern.unwrap()); // {name: 'John'}
    }
})();
```

## Usage with Javascript framework

### Plain Javascript

```js
// Chaining tryAsync to avoid callback nesting

const getUser = async (id) => {
  // API call to fetch user 
};

const getFriends = async (user) => {
  // API call to get user's friends
};

const renderProfile = async (user, friends) => {
  // Render profile page
};

// Without tryAsync
getUser(1)
  .then(user => {
    return getFriends(user) 
      .then(friends => {
        renderProfile(user, friends);
      })
  })
  .catch(err => {
    // Handle error
  });

// With tryAsync
const user = await tryAsync(getUser(1))
  .recover(handleGetUserError)
  .getOrElse({id: 1}); 

const friends = await tryAsync(getFriends(user))
  .recover(handleGetFriendsError)
  .getOrElse([]);

renderProfile(user, friends);

```

### React

```jsx
import React, { useState, useEffect } from 'react';
import { tryAsync } from '@eznix/try';

function MyComponent() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const user = await tryAsync(fetch('/api/user'))
        .recover(handleFetchError)
        .getOrElse(null);
      
      setUser(user);
    }

    fetchUser();
  }, []);

  if (!user) {
    return <p>Loading...</p>;
  }

  return <Profile user={user} />;
}

function handleFetchError(err) {
  console.error(err);
  return null;
}
```

### Vue

```html
<template>
  <div v-if="loading">
    Loading...
  </div>

  <div v-else-if="error">
    {{ errorMessage }}
  </div>

  <div v-else>
    <UserProfile :user="user"/>
  </div>
</template>

<script>
import { ref } from 'vue';
import { tryAsync } from '@eznix/try';

export default {
  setup() {
    const user = ref(null);
    const loading = ref(true);
    const error = ref(null);

    async function fetchUser() {
      user.value = await tryAsync(loadUser)
        .recover(handleError)
        .getOrElse(null);
      
      loading.value = false;
    }

    function handleError(err) {
      error.value = err;
    }

    function loadUser() {
      return fetch('/api/user').then(res => res.json());
    }

    fetchUser();

    return { user, loading, error };
  }
}
</script>
```

### Svelte

```svelte
<script>
import { tryAsync } from '@eznix/try';

let user = null;
let error = null;
let loading = true;

async function getUser() {
  user = await tryAsync(fetchUser)
    .recover(handleError)
    .getOrElse(null);
  
  loading = false; 
}

function handleError(err) {
  error = err;
}

async function fetchUser() {
  // API call to fetch user
}

getUser();
</script>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p>Error: {error.message}</p>  
{:else}
  <UserProfile {user} />
{/if}
```

## Contributing

Feel free to open an issue or a pull request. Please make sure to run `bun test` before opening a pull request.
