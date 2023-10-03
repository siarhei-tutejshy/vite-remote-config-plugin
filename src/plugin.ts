import {IndexHtmlTransform, Plugin} from 'vite';
import PluginServer from "./server";
import {Options} from "./types";
import htmlTransformHook from "./html-transform-hook";


const INTERNAL_PLUGIN_SAVE_CONTAINER_NAME = 'viteRemoteConfigPluginServer'

function getTransformIndexHtml(hook: boolean | IndexHtmlTransform, getServerInstance: () => PluginServer): IndexHtmlTransform {
    if (!hook) {
        return null;
    }
    return typeof hook === 'boolean' ? htmlTransformHook(getServerInstance) : hook
}

export const RemoteConfig = (options: Options = {}): Plugin => {
    let pluginServer: PluginServer;
    return {
        enforce: 'post',
        name: 'aibuy:vite:server-remote-configure',
        apply: 'serve',
        config(config) {
            // get or create from previous instance
            pluginServer = config[INTERNAL_PLUGIN_SAVE_CONTAINER_NAME] || new PluginServer(options.port);
            return pluginServer.updateConfig(config);
        },
        configureServer(server) {
            pluginServer.updateViteServer(server);
            // save to next instance
            server.config.inlineConfig[INTERNAL_PLUGIN_SAVE_CONTAINER_NAME] = pluginServer;
        },
        transformIndexHtml: getTransformIndexHtml(options.injectTransform, () => pluginServer),
    };
};
