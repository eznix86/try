import { tryAsync } from "@eznix/try";

/**
 * 
 * @returns {Promise<{}>}
 */
async function gettingErrors() {
	let response = fetch("https://jsonplaceholder.typicode.csom/posts");
    return (await response).json();
}

const result = await tryAsync(gettingErrors);
const handled = await result.getOrElse({ error: "Something went wrong" });

console.log(handled)
