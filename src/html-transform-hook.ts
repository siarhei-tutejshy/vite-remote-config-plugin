import {IndexHtmlTransformResult, IndexHtmlTransformHook} from "vite";
import PluginServer from "./server";
import injectScript from "./inject-script.ts?raw"

const htmlTransformHook = (getServerInstance: () => PluginServer): IndexHtmlTransformHook => {
    return (html: string): IndexHtmlTransformResult => {
        const server = getServerInstance()
        const script = injectScript
            .replace('[\'{{ens}}\']', JSON.stringify(server.envs))
            .replace('{{wsPath}}', server.internalWsUrl)
            .replace('{{changeEvent}}', server.changeEventName);
        return {
            html,
            tags: [{
                tag: 'script',
                injectTo: 'body',
                children: script
            }],
        };
    }
}

export default htmlTransformHook;
