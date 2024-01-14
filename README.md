# Try

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

> [!WARNING]
> It is not yet published on npm.

```bash
bun add @eznix/try
yarn install @eznix/try
pnpm add @eznix/try
npm install @eznix/try
```

## Wrapping Asynchronous Operations

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
    let fn = await tryAsync<number, any>(async () => {
        return 10000;
    });

    // Getting the result value or a default if there is an error
    let value: number = await fn.getOrElse(11);
    console.log('Value:', value); // 10000

    // Getting the error, if any
    let error = await fn.error();
    console.log('Error:', error); // null

    // Getting both errors and data in a single Promise
    let { error: errors, data } = await fn.toPromise();
    console.log('Errors:', errors); // null
    console.log('Data:', data); // 10000

    // Recovering from errors by providing a fallback value
    let recoveredTry = await fn.recover((error) => 100);
    console.log('RecoveredTry:', recoveredTry); // Promise<Try<number, any>>

    let { data: recovered } = await recoveredTry.toPromise();
    console.log('Recovered:', recovered); // 10000

    // Getting the result in a structured way
    let resultPattern = await fn.result();

    // Handling the result using the Result class
    if (resultPattern.isOk() && !resultPattern.isNull()) {
        console.log("ResultPattern", resultPattern.unwrap()); // 10000
    } else {
        console.log("ResultPattern", resultPattern.unwrapErr()); // null
    }
})();
```

## Usage with Javascript framework

### React

```jsx
import React, { useEffect, useState } from "react";
import { tryAsync } from "@eznix/try";

const MyComponent = () => {
  const [value, setValue] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      let fn = await tryAsync(async () => {
        // Your asynchronous operation here
        return 10000;
      });

      setValue(await fn.getOrElse(11));

      console.log("Value:", value);
    };

    fetchData();
  }, [value]);

  return <p>Value: {value}</p>;
};

export default MyComponent;
```

### Vue

```html
<template>
  <div>
    <p>Value: {{ value }}</p>
  </div>
</template>

<script>
import { tryAsync } from "@eznix/try";

export default {
  async mounted() {
    let fn = await tryAsync(async () => {
      // Your asynchronous operation here
      return 10000;
    });

    this.value = await fn.getOrElse(11);

    console.log("Value:", this.value);
  },
  data() {
    return {
      value: null,
    };
  },
};
</script>
```

### Svelte

```html
<script>
  import { onMount } from "svelte";
  import { tryAsync } from "@eznix/try";

  onMount(async () => {
    let fn = await tryAsync(async () => {
      // Your asynchronous operation here
      return 10000;
    });

    let value = await fn.getOrElse(11);

    console.log("Value:", value);
  });
</script>
```

## Contributing

Feel free to open an issue or a pull request. Please make sure to run `bun test` before opening a pull request.

## TODO

- [ ] Create a unified function to wrap sync functions and async functions and returns the appropriate type/signature.
