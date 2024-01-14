import { expect, test } from "bun:test";
import { tryAsync } from "~/try-async";

test("recover() recovers from errors", async () => {
	const error = new Error("Original error");
	const recoveredValue = "Recovered value";
	const tryInstance = await tryAsync<any, Error>(async () => {
		throw error;
	});

	const recoveredTry = tryInstance.recover((err) => recoveredValue);
	const result = await recoveredTry.result();

	expect(result.isOk()).toBe(true);
	expect(result.unwrap()).toBe(recoveredValue);
});

test("error() returns the error for failed Try instances", async () => {
	const error = new Error("Something went wrong");
	const tryInstance = await tryAsync<any, Error>(async () => {
		throw error;
	});

	const retrievedError = await tryInstance.error();
	expect(retrievedError).toBe(error);
});

test("error() returns null for successful Try instances", async () => {
	const data = 10;
	const tryInstance = await tryAsync<any, Error>(async () => {
		return data;
	});
	const retrievedError = await tryInstance.error();
	expect(retrievedError).toBeNull();
});

test("toPromise() returns the underlying promise", async () => {
	const data = "Some data";
	const originalPromise = await Promise.resolve({ error: null, data });
	const tryInstance = await tryAsync<any, Error>(async () => {
		return data;
	});
	const resolvedData = await tryInstance.toPromise();
	expect(resolvedData).toEqual(originalPromise);
});

test("getOrElse() returns the default value for failed or null Try instances", async () => {
	const defaultValue = "Default value";

	const tryInstance = await tryAsync<any, Error>(async () => {
		throw new Error("Failed");
	});

	const result = await tryInstance.getOrElse(defaultValue);
	expect(result).toBe(defaultValue);
});

test("getOrElse() returns the data for successful Try instances", async () => {
	const data = "Some data";
	const tryInstance = await tryAsync<any, Error>(async () => {
		return data;
	});
	const result = await tryInstance.getOrElse("Default value");
	expect(result).toBe(data);
});

test("result() returns a successful Result for successful Try instances", async () => {
	const data = 10;
	const tryInstance = await tryAsync<any, Error>(async () => {
		return data;
	});
	const result = await tryInstance.result();
	expect(result.isOk()).toBe(true);
	expect(result.unwrap()).toBe(data);
});

test("result() returns a failed Result for failed Try instances", async () => {
	const error = new Error("Something went wrong");
	const tryInstance = await tryAsync<any, Error>(async () => {
		throw error;
	});

	const result = await tryInstance.result();
	expect(result.isOk()).toBe(false);
	expect(result.unwrapErr()).toBe(error);
});

test("try() creates a successful Try for successful promise calls", async () => {
	const data = "Some data";
	const promiseFn = async () => data;

	const tryInstance = await tryAsync(promiseFn);
	const result = await tryInstance.result();

	expect(result.isOk()).toBe(true);
	expect(result.unwrap()).toBe(data);
});

test("try() creates a failed Try for failed promise calls", async () => {
	const error = new Error("Something went wrong");
	const promiseFn = async () => {
		throw error;
	};

	const tryInstance = await tryAsync(promiseFn);
	const result = await tryInstance.result();

	expect(result.isOk()).toBe(false);
	expect(result.unwrapErr()).toBe(error);
});
