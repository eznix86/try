import { expect, test } from "bun:test";
import { trySync } from '~/try-sync';

test('recover() recovers from errors', () => {
    const error = new Error('Original error');
    const recoveredValue = 'Recovered value';
    const tryInstance = trySync<any, Error>(() => {
        throw error;
    })

    const recoveredTry = tryInstance.recover((err) => recoveredValue);
    const result = recoveredTry.result();

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(recoveredValue);
});


test('error() returns the error for failed Try instances', () => {
    const error = new Error('Something went wrong');
    const tryInstance = trySync<any, Error>(() => {
        throw error;
    })

    const retrievedError = tryInstance.error();
    expect(retrievedError).toBe(error);
});

test('error() returns null for successful Try instances', () => {
    const data = 10;
    const tryInstance = trySync<any, Error>(() => {
        return data;
    })
    const retrievedError = tryInstance.error();
    expect(retrievedError).toBeNull();
});

test("to() returns the underlying ", () => {
    const data = "Some data";
    const original = { error: null, data };
    const tryInstance = trySync<any, Error>(() => {
        return data;
    });
    const resolvedData = tryInstance.to();
    expect(resolvedData).toEqual(original);
});

test('getOrElse() returns the default value for failed or null Try instances', () => {
    const defaultValue = 'Default value';

    const tryInstance = trySync<any, Error>(() => {
        throw new Error('Failed')
    });

    const result = tryInstance.getOrElse(defaultValue);
    expect(result).toBe(defaultValue);
});

test('getOrElse() returns the data for successful Try instances', () => {
    const data = 'Some data';
    const tryInstance = trySync<any, Error>(() => {
        return data
    });
    const result = tryInstance.getOrElse('Default value');
    expect(result).toBe(data);
});

test('result() returns a successful Result for successful Try instances', () => {
    const data = 10;
    const tryInstance = trySync<any, Error>(() => {
        return data
    });
    const result = tryInstance.result();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(data);
});

test('result() returns a failed Result for failed Try instances', () => {
    const error = new Error('Something went wrong');
    const tryInstance = trySync<any, Error>(() => {
        throw error
    });

    const result = tryInstance.result();
    expect(result.isOk()).toBe(false);
    expect(result.unwrapErr()).toBe(error);
});

test('trySync() creates a successful Try for successful calls', () => {
    const data = 'Some data';
    const fn = () => data;

    const tryInstance = trySync(fn);
    const result = tryInstance.result();

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(data);
});

test('trySync() creates a failed Try for failed  calls', () => {
    const error = new Error('Something went wrong');
    const fn = () => { throw error; };

    const tryInstance = trySync(fn);
    const result = tryInstance.result();

    expect(result.isOk()).toBe(false);
    expect(result.unwrapErr()).toBe(error);
})