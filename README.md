# HomeAssistant React Hooks

This is a collection of react hooks and apis to get state / push events to home assistant using websockets.
It can be used to for example create custom dashboards that integrate with home assistant.

[Package on NPM](https://www.npmjs.com/package/homeassistant-react-hooks)

## Installation

You can use this library by running either `yarn add homeassistant-react-hooks` or `npm i homeassistant-react-hooks`

### Token

To create a token that can be used with this, go to your [user profile](https://my.home-assistant.io/redirect/profile/) and scroll down to the bottom where you can create a token.

## Examples

### Code example

```tsx
import { HassProvider, useHassDevice } from "homeassistant-react-hooks";

// This should be loaded from an external file (to not expose secrets in for example version control)
const config = {
    token: "HOME_ASSISTANT_ACCESS_TOKEN",
    host: "example.com",
};

const MediaPlayer = () => {
    const { title, artist, imgUrl } = useMediaPlayer("kitchen");

    return (
        <div className="media-player">
            <h1>{title} - {artist}</h1>
            <img src={imgUrl} alt="Artwork" />
        </div>
    );
}

const App = () => {
    return (
        <HassProvider token={config.token} connectionOptions={{ host: config.host, port: 443, protocol: "wss" }}>
            <MediaPlayer />
        </HassProvider>
    );
};
```

### Projects using this module

 - [alvesvaren/pihubv3](https://github.com/alvesvaren/pihubv3)

## Hooks

To see what each hook returns, use your editor's intellisense (because I'm too lazy to add all of them to this list)

### `useHassDevice`

Access a "raw" home assistant device, with access to all attributes and data, create using the full entity id, for example `media_player.kitchen`

### `useLight`

Access a light in home assistant. This is probably missing some fields because my lights that I can control with home assistant does not support color so I can't test that. Feel free to create a pull request fixing it if you want.

Do not include the domain in the entity id, for example `bedroom_ceiling_1` instead of `light.bedroom_ceiling_1`

### `useMediaPlayer`

Access a cleaned up / processed media player object containing things like position and artwork url etc.

Do not include the domain in the entity id, for example `bedroom_ceiling_1` instead of `light.bedroom_ceiling_1`

### `useWeather`

Access a weather object with some added fields (like minimum temperature etc.)

This might not work if the weather source isn't setting the first day forecast to today, something I know for example the SMHI source is doing wrong.
