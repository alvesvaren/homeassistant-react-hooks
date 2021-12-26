# HomeAssistant React Hooks

This is a collection of react hooks and apis to get state / push events to home assistant using websockets

## Installation

You can use this library by running either `yarn add homeassistant-react-hooks` or `npm i homeassistant-react-hooks`

## Code example

```tsx
import { HassProvider, useHassDevice } from "homeassistant-react-hooks";

// This should be loaded from an external file
const config = {
    token: "HOME_ASSISTANT_ACCESS_TOKEN",
};

const App = () => {
    const kitchenPlayer = useHassDevice("media_player.kitchen");

    const { media_title, media_artist, entity_picture } = kitchenPlayer?.attributes ?? {};

    return (
        <HassProvider token={config.token} connectionOptions={{ host: "example.com", port: 443, protocol: "wss" }}>
            <div>
                {media_title} - {media_artist}
            </div>
            <img src={entity_picture} alt='Album artwork' />
        </HassProvider>
    );
};
```

## Hooks

-   `const device = useHassDevice(deviceName)` - Access a "raw" home assistant device, with access to all attributes and data
