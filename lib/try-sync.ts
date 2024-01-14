import Result from "~/result";

class TrySync<T, E = unknown> {
    readonly r: { error: E | null; data: T | null };

    constructor(result: { error: E | null; data: T | null }) {
        this.r = result;
    }

    recover(fn: (error: E) => T): TrySync<T, E | null> {
        return new TrySync<T, E | null>({
            error: null,
            data:
                this.r.data !== null
                    ? this.r.data
                    : this.r.error !== null
                        ? fn(this.r.error)
                        : null,
        });
    }


    error(): E | null {
        return this.r.error;
    }

    to(): { error: E | null; data: T | null } {
        return this.r;
    }

    getOrElse(defaultValue: T): T {
        const { error, data } = this.r;
        if (error !== null || data === null) {
            return defaultValue;
        }

        return data;
    }


    // @warn Use proper checks before unwrapping
    result(): Result<T, E> {
        let {error, data} = this.r;
        if (error !== null) {
            return new Result<T, E>(error, true);
        }

        return new Result<T, E>(data, false);
    }

    static trySync<T, E = unknown>(fn: () => T): TrySync<T, E> {
        try {
            const data = fn();
            return new TrySync<T, E>({ error: null as E | null, data });
        } catch (error: unknown) {
            return new TrySync<T, E>({ error: error as E, data: null });
        }
    }
}

const trySync = TrySync.trySync;

export { trySync };
