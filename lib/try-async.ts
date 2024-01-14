import Result from "~/result";

class Try<T, E = unknown> {
	readonly promise: Promise<{ error: E | null; data: T | null }>;

	constructor(promise: Promise<{ error: E | null; data: T | null }>) {
		this.promise = promise;
	}

	recover(fn: (error: E) => T): Try<T, E> {
		return new Try(
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

	static async try<T, E = unknown>(
		promiseFn: () => Promise<T>,
	): Promise<Try<T, E>> {
		try {
			const result = await promiseFn();
			return new Try<T, E>(Promise.resolve({ error: null, data: result }));
		} catch (error) {
			return new Try<T, E>(Promise.resolve({ error: error as E, data: null }));
		}
	}
}

const tryAsync = Try.try;

export { tryAsync };
