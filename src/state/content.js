import { storage } from '../data/storage.js';
import { createStore } from '../store.js';
import { status } from './status.js';

class ContentStore {
    #objectStores = {};
    #saveTimeout;

    /**
     * @param {string} objectId
     */
    getObjectStore(objectId) {
        if (!this.#objectStores[objectId]) {
            const value = storage.get(`object_${objectId}`) || {};
            const store = createStore(value);
            store.subscribe(object => this.#onSetObject(objectId, object));
            this.#objectStores[objectId] = store;
        }

        return this.#objectStores[objectId];
    }

    /**
     * @param {string} objectId
     * @param {object} object
     */
    #onSetObject(objectId, object) {
        clearTimeout(this.#saveTimeout);
        this.#saveTimeout = setTimeout(
            () => this.#saveObject(objectId, object),
            100
        );
    }

    /**
     * @param {string} objectId
     * @param {object} object
     */
    #saveObject(objectId, object) {
        storage.set(`object_${objectId}`, object);
        status.set('Your modifications are saved locally.');
    }

    publish() {
        new Error('Not implemented');
    }

    discard() {
        for (const objectId in this.#objectStores) {
            const object = {};
            this.#objectStores[objectId].set(object);
            clearTimeout(this.#saveTimeout);
            this.#saveObject(objectId, object);
        }
        status.set('All changes have been discarded.');
    }
}

export const content = new ContentStore();