import hass, { HassApi } from "homeassistant-ws";
import { EventEmitter } from "events";
import { createContext } from "react";

export interface HassEntity {
    attributes: {
        [key: string]: any;
        friendly_name?: string;
    };
    context: {
        id: string;
        user_id: string;
        parent_id: string;
    };
    entity_id: string;
    last_changed: string;
    last_updated: string;
    state: string;
}

export interface ConnectionOptions {
    host: string;
    port: number;
    protocol: "ws" | "wss";
}

export class HassApiConnection {
    emitter: EventEmitter;
    token: string;
    connectionOptions: ConnectionOptions;
    hassClient: HassApi | null = null;
    state: { [entityId: string]: HassEntity } = {};

    constructor(token: string, connectionOptions: ConnectionOptions) {
        this.token = token;
        this.connectionOptions = connectionOptions;
        this.emitter = new EventEmitter();
        this._createClient();

        setInterval(async () => {
            if ((this.hassClient?.rawClient?.ws?.readyState || 0) > 1) {
                await this._createClient();
            }
        }, 1000 * 10);
    }

    _convertStateArrayToMap(stateArray: HassEntity[]) {
        const newState: { [entityId: string]: HassEntity } = {};
        stateArray.forEach(state => {
            newState[state.entity_id] = state;
        });

        return newState;
    }

    async _createClient() {
        try {
            this.hassClient = await hass({ token: this.token, ...this.connectionOptions });
        } catch {
            console.error("Could not create client!");
            return;
        }

        const initialState: HassEntity[] = await this.hassClient.getStates();
        this.state = this._convertStateArrayToMap(initialState);
        initialState.forEach(state => {
            this.emitter.emit("state_changed#" + state.entity_id, state);
        });

        this.hassClient.on("state_changed", event => {
            this.state[event.data.entity_id] = event.data.new_state;
            this.emitter.emit("state_changed#" + event.data.entity_id, event.data.new_state);
        });
    }

    async send(domain: string, action: string, data: any = {}) {
        return await this.hassClient?.callService(domain, action, data);
    }
}
export default HassApiConnection;

export const HassContext = createContext<HassApiConnection | null>(null);

export const HassProvider: React.FC<{
    token: string;
    connectionOptions: ConnectionOptions;
}> = ({ token, connectionOptions, children }) => {
    const api = new HassApiConnection(token, connectionOptions);
    return <HassContext.Provider value={api}>{children}</HassContext.Provider>;
};
