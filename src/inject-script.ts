import {createClient} from "./inject-script.helper";

const ws = createClient('{{wsPath}}');

const defineToWindow = (methods: Record<string, Function>) => {
    Object.entries(methods).forEach(([key, fn]) => {
        Object.defineProperty(window, key, {
            value: fn,
            configurable: false,
            writable: false,
        })
    })
}

defineToWindow({
    changeEnvTo: ws.changeEnvTo.bind(ws),
    changeDefineTo: ws.changeDefineTo.bind(ws),
    changeMetaEnvTo: ws.changeMetaEnvTo.bind(ws),
})


