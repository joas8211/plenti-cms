/**
 * @template T
 * @param {T} value 
 */
export function createStore(value) {
    const listeners = {};
    let newKey = 1;
    return {
        /**
         * @returns T
         */
        get() {
            return value;
        },

        /**
         * @param {T} newValue 
         */
        set(newValue) {
            const oldValue = value;
            value = newValue;
            for (const listener of Object.values(listeners)) {
                listener(newValue, oldValue);
            }
        },

        /**
         * @param {(newValue: T, oldValue: T)} listener
         * @returns Function to unsubscribe
         */
        subscribe(listener) {
            const key = newKey++;
            listeners[key] = listener;
            return () => {
                delete listeners[key];
            };
        },
    };
}