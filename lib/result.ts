export default class Result<T, E> {
	constructor(
		private value: T | E | null,
		private isError: boolean,
	) {}

	isOk() {
		return !this.isError;
	}

	isNull() {
		return this.value === null;
	}

	unwrap(): T {
		if (this.value instanceof Error) {
            throw this.value;
		}

		return this.value as T;
	}

	unwrapErr(): E {
		if (!(this.value instanceof Error)) {
			throw new Error("Cannot unwrap error: value is not an error");
		}

		return this.value as E;
	}
}
