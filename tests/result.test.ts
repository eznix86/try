import { expect, test } from "bun:test";
import Result from '~/result';

test('isOk() returns true for successful results', () => {
    const result = new Result<number, null>(10, false);
    expect(result.isOk()).toBe(true);
});

test('isOk() returns false for error results', () => {
    const error = new Error('Something went wrong');
    const result = new Result<null, Error>(error, true);
    expect(result.isOk()).toBe(false);
});

test('isNull() returns true for null results', () => {
    const result = new Result(null, false);
    expect(result.isNull()).toBe(true);
});

test('isNull() returns false for non-null results', () => {
    const result = new Result(10, false);
    expect(result.isNull()).toBe(false);
});

test('unwrap() returns the value for successful results', () => {
    const result = new Result<number, null>(10, false);
    expect(result.unwrap()).toBe(10);
});

test('unwrap() throws the error for error results', () => {
    const error = new Error('Something went wrong');
    const result = new Result<null, Error>(error, true);
    expect(() => result.unwrap()).toThrow(error);
});

test('unwrapErr() returns the error for error results', () => {
    const error = new Error('Something went wrong');
    const result = new Result<Error, Error>(error, false);
    expect(result.unwrapErr()).toBe(error);
});

test('unwrapErr() throws an error for non-error results', () => {
    const result = new Result<number, string>(10, false);
    expect(() => result.unwrapErr()).toThrow('Cannot unwrap error: value is not an error');
});
