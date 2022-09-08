"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tracker_1 = require("@openreplay/tracker/cjs");
const index_js_1 = require("./syncod/index.js");
function processMutationAndState(app, options, encoder, mutation, state) {
    if (options.filter(mutation, state)) {
        try {
            const _mutation = encoder.encode(options.mutationTransformer(mutation));
            const _state = encoder.encode(options.transformer(state));
            const _table = encoder.commit();
            for (let key in _table)
                app.send(tracker_1.Messages.OTable(key, _table[key]));
            app.send(tracker_1.Messages.Zustand(_mutation, _state));
        }
        catch (e) {
            encoder.clear();
            app.debug.error(e);
        }
    }
}
function default_1(opts = {}) {
    const options = Object.assign({
        filter: () => true,
        transformer: state => state,
        mutationTransformer: mutation => mutation,
    }, opts);
    return (app) => {
        if (app === null) {
            return Function.prototype;
        }
        const encoder = new index_js_1.Encoder(index_js_1.sha1, 50);
        const state = {};
        return (storeName = Math.random().toString(36).substring(2, 9)) => (config) => (set, get, api) => config((...args) => {
            set(...args);
            const newState = get();
            state[storeName] = newState;
            const triggeredActions = args.map(action => { var _a; return (_a = action.toString) === null || _a === void 0 ? void 0 : _a.call(action); });
            processMutationAndState(app, options, encoder, triggeredActions, state);
        }, get, api);
    };
}
exports.default = default_1;
