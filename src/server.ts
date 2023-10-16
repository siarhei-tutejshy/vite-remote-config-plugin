import {loadEnv, ResolvedConfig, UserConfig, ViteDevServer,} from "vite";
import fg from 'fast-glob';
import {createServer, Server, STATUS_CODES} from 'node:http'
import {Event} from './event'
import {Info, Message, Update} from "./types";
import {RawData, WebSocketServer} from "ws";
import {uniq} from "./utils";


const DEFAULT_PORT = 32123

export default class PluginServer {
    private internalServer = this.createInternalServer();
    private internalWss: WebSocketServer = null;
    private viteServer: ViteDevServer = null;

    private currentUpdate: Update = null;
    private config: ResolvedConfig = null;

    constructor(private port: number = DEFAULT_PORT) { }

    get internalWsUrl() {
        return `ws://localhost:${this.port}`;
    }

    get changeEventName() {
        return Event.change;
    }

    get envs(): string[] {
        return uniq([
            'development',
            ...fg.globSync('.env.*', {
                onlyFiles: true,
                cwd: this.config.envDir,
            }).map(file => /^\.env\.(\w+)(\.local)?$/.exec(file)?.[1])
        ])
    }

    updateConfig(currentConfig: UserConfig): UserConfig {
        if (!this.currentUpdate) {
            return;
        }
        return {
            mode: this.currentUpdate.mode ?? currentConfig.mode,
            define: {
                ...currentConfig.define ?? {},
                ...this.currentUpdate.define ?? {},
            },
            server: {
                ...currentConfig.server,
                open: false,
            }
        }
    }

    updateViteServer(internalServer: ViteDevServer) {
        if (this.viteServer !== internalServer) {
            this.viteServer = internalServer;
        }
    }

    setConfig(config: ResolvedConfig) {
        this.config = config;
        this.listen()
        this.sendUpdate();
    }

    listen() {
        if (!this.internalServer.listening) {
            this.internalServer.listen(this.port);
            this.createInternalWebsocket();
            this.subscribeToWsEvents();
            this.subscribeToClose();
        }
    }

    private createInternalServer(): Server {
        return createServer(((_, response) => {
            const statusCode = 426
            const body = STATUS_CODES[statusCode]
            if (!body)
                throw new Error(`No body text found for the ${statusCode} status code`)

            response.writeHead(statusCode, {
                'Content-Length': body.length,
                'Content-Type': 'text/plain',
            })
            response.end(body)
        }))
    }

    private createInternalWebsocket() {
        this.internalWss = new WebSocketServer({ server: this.internalServer });
    }

    private subscribeToClose() {
        process.on('exit', () => {
            this.internalWss?.close();
            this.internalServer?.close();
        })
    }

    private subscribeToWsEvents() {
        this.internalWss.on('connection', ws => {
            ws.on('message', this.handleMessages)
        })
    }

    private handleMessages = (raw: RawData) => {
        try {
            const message = this.getMessage(raw);
            if (message?.event && Object.values(Event).includes(message.event)) {
                this.handleByEvent(message.event, message.data);
            }
        } catch (error) {
            console.error(error)
        }
    }

    private handleByEvent(event: Event, data: any) {
        if (event === Event.change) {
            return this.handleChangeEvent(data);
        }
        if (event === Event.update) {
            return this.sendUpdate();
        }
    }

    private getMessage<T = any>(raw: RawData): Message<T> {
        try {
            const content = String(raw);
            return JSON.parse(content)
        } catch (error) {
            console.error(error)
            return {
                event: null,
                data: null,
            }
        }
    }

    private handleChangeEvent = async (data: Update)=>  {
        this.currentUpdate = data;
        this.viteServer.config.inlineConfig.mode = data.mode;
        await this.viteServer.restart();
    }

    private sendUpdate = () => {
        const config = this.config;
        const variables = loadEnv(config.mode, config.envDir);
        this.send(Event.update, {
            mode: config?.mode,
            envs: this.envs,
            variables,
            define: config?.define ?? {},
        })
    }

    private send(event: Event, data: Info) {
        this.internalWss.clients.forEach(ws => {
            ws.send(JSON.stringify({
                event,
                data,
            }))
        })
    }
}
