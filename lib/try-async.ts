import Result from "~/result";

class TryAsync<T, E = Error | null> {
	readonly promise: Promise<{ error: E | null; data: T | null }>;

	constructor(promise: Promise<{ error: E | null; data: T | null }>) {
		this.promise = promise;
	}

	recover(fn: (error: E) => T): TryAsync<T, E> {
		return new TryAsync(
			this.promise.then(({ error, data }) => ({
				error: null,
				data: data !== null ? data : error !== null ? fn(error) : null,
			})),
		);
	}

	async error(): Promise<E | null> {
		return this.promise.then(({ error }) => error);
	}

	toPromise(): Promise<{ error: E | null; data: T | null }> {
		return this.promise;
	}

	async getOrElse(defaultValue: T): Promise<T> {
		return this.promise.then(({ error, data }) => {
			if (error !== null || data === null) {
				return Promise.resolve(defaultValue);
			}

			return Promise.resolve(data);
		});
	}

	// @warn Use proper checks before unwrapping
	async result(): Promise<Result<T, E>> {
		return this.promise.then(({ error, data }) => {
			if (error !== null) {
				return Promise.resolve(new Result<T, E>(error, true));
			}

			return Promise.resolve(new Result<T, E>(data, false));
		});
	}

}

async function tryAsync<T, E = Error | null>(
	promiseFn: () => Promise<T>,
): Promise<TryAsync<T, E>> {
	try {
		const result = await promiseFn();
		return new TryAsync<T, E>(Promise.resolve({ error: null, data: result }));
	} catch (error: unknown) {
		return new TryAsync<T, E>(Promise.resolve({ error: error as E, data: null }));
	}
}

export { tryAsync };
