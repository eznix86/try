# Try

Treat Errors should be values for async functions. Stop the callback hell (nested then) and the tower of doom (try catch block).

## Getting Started

```bash
bun add @eznix/try
yarn install @eznix/try
pnpm add @eznix/try
npm install @eznix/try
```

## Wrapping Asynchronous Operations

```js
// fetchUser is an async function
const tryFetchUser = await tryAsync(fetchUser);
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
// compared to getOrElse() function, you can try other stuff, like another fetch
// it will return errors as value.
const recoveredTry = await tryFetchUser.recover((error) => defaultUser);
```

### Unwrap Result (Carefully)

```js
const result = await tryFetchUser.result();
console.log(result.isOk()); // true
console.log(result.unwrap())
```

## Examples

Examples of using tryAsync.

### Basic

```js
// Wrapping a potentially failing asynchronous operation:
const fetchUser = async (id: number): Promise<User> => {
  try {
    const response = await fetch(`/api/users/${id}`);
    const user = await response.json();
    return user;
  } catch (error) {
    throw new Error(`Failed to fetch user ${id}`);
  }
};

const tryFetchUser = await tryAsync(fetchUser(123));

// Handling the result:
  const user = await tryFetchUser.getOrElse("I want this message instead");
  console.log("User: ", user);
  // User: I want this message instead

```

### All features

```js
// Example Usage:
(async () => {
    // Trying an asynchronous operation using tryAsync
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

```vue
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

```svelte
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
