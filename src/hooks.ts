import { useContext, useState } from "react";
import { useEffectOnce, useInterval } from "react-use";
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

export function useWeather(weatherSourceId: string) {
    const weatherData = useHassDevice("weather." + weatherSourceId);

    const { humidity, temperature, wind_speed, wind_bearing, forecast } = weatherData?.attributes ?? {};
    const today: { templow: number; temperature: number } = forecast?.[0] ?? {};

    return { humidity, temperature, wind_speed, wind_bearing, today, state: weatherData?.state || null };
}

export function useMediaPlayer(playerId: string) {
    const [realPosition, setRealPosition] = useState(0);
    const playerData = useHassDevice("media_player." + playerId);

    const { state, attributes } = playerData ?? {};
    const { media_title, media_artist, entity_picture, media_duration, media_position, media_channel, media_position_updated_at } = attributes ?? {};
    const isPlaying = state === "playing";
    useInterval(() => {
        const currentRealPosition =
            media_position +
            ((isPlaying ? new Date().getTime() : new Date(media_position_updated_at).getTime()) - new Date(media_position_updated_at).getTime()) / 1000;
        setRealPosition(currentRealPosition);
    }, 200);

    const api = useContext(HassContext);

    const isLive = isNaN(realPosition) && media_duration === 0;
    const hasSong = media_title || media_artist || media_channel || media_duration;
    const imgUrl = entity_picture ? "//" + api?.connectionOptions.host + entity_picture : null;
    const togglePause = () => api?.send("media_player", "media_play_pause", { entity_id: "media_player." + playerId });
    const setVolume = async (volume: number) => await api?.send("media_player", "volume_set", { entity_id: "media_player." + playerId, volume_level: volume });

    return {
        isPlaying,
        isLive,
        hasSong,
        state,
        imgUrl,
        position: realPosition,
        title: media_title,
        artist: media_artist,
        duration: media_duration,
        channel: media_channel,
        togglePause,
        setVolume,
    };
}

export function useLight(lightId: string) {
    const light = useHassDevice("light." + lightId);

    if (!light) {
        return null;
    }

    const { friendly_name, brightness, color } = light.attributes ?? {};
    const api = useApi();

    return {
        on: light.state === "on",
        friendly_name,
        brightness,
        color,
        state: light.state,
        setOn: () => api?.send("light", "turn_on", { entity_id: "light." + lightId }),
    };
}
