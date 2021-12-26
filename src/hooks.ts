import { useContext, useState } from "react";
import { useEffectOnce } from "react-use";
import { HassEntity, HassContext } from "./hassApi";

export function useHassDevice(entityId: string) {

    let api = useContext(HassContext);

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
