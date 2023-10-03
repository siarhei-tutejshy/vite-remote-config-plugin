
export class WebsocketClient {
    private ws: WebSocket = null;
    constructor(url: string | URL) {
        this.ws = new WebSocket(url);
    }

    public send(data: any) {
        this.ws.send(JSON.stringify({event: '{{changeEvent}}', data}))
    }

    public changeEnvTo(env: string) {
        this.send({ mode: env });
    }

    public changeDefineTo(define: Record<string, string>) {
        const newDefine = Object.entries(define).reduce((acc, [key, value]) => {
            acc[key] = JSON.stringify(value);
            return acc;
        }, {});
        this.send({define: newDefine});
    };

    public changeMetaEnvTo(define: Record<string, string>) {
        const newDefine = Object.entries(define).reduce((acc, [key, value]) => {
            const importKey = `import.meta.env.${key}`;
            acc[importKey] = value;
            return acc;
        }, {});
        this.changeDefineTo(newDefine)
    };
}

export const createClient = (wsPath: string): WebsocketClient => {
    return new WebsocketClient(wsPath)
}


