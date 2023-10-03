import {Event} from "./event";
import {IndexHtmlTransform} from "vite";

export interface Update {
    mode?: string,
    define?: Record<string, unknown>,
}

export interface Message<T = any> {
    event: Event,
    data: T,
}

export interface Info {
    envs: string[],
    mode: string,
    variables: Record<string, string>,
    define: Record<string, any>,
}

export interface Options {
    injectTransform?: boolean | IndexHtmlTransform,
    port?: number,
}
