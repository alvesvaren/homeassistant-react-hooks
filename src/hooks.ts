import { useContext, useState } from "react";
import { useEffectOnce } from "react-use";
import { HassEntity, HassContext } from "./hassApi";

export function useHassDevice(entityId: string) {
    const api = useContext(HassContext);

    const [state, setState] = useState<HassEntity | null>(null);
    useEffectOnce(() => {
        if (!api) {
            throw new Error("No HassProvider was set");
        }
        const updateState = (entity: HassEntity) => {
            setState(entity);
        };
        updateState(api.state[entityId]);

        api.emitter.on("state_changed#" + entityId, updateState);
        return () => {
            api?.emitter.off("state_changed#" + entityId, updateState);
        };
    });

    return state;
}

export function useApi() {
    return useContext(HassContext);
}

export function useLight(lightId: string) {
    const light = useHassDevice("light." + lightId);

    if (!light) {
        return null;
    }

    const { friendly_name, brightness, color } = light.attributes ?? {};
    const api = useApi();

    return [
        { on: light.state === "on", friendly_name, brightness, color, state: light.state },
        { setOn: () => api?.send("light", "turn_on", { entity_id: "light." + lightId }) },
    ];
}
