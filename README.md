# Snowed In

A cozy Claude Code mod. It puts a snowy night behind your Claude Code conversation: a lit cabin among pine trees, with snow drifting down. It also gives the app a matching night-blue color theme.

The snow piles up as your context window fills. At the start of a session it's a light dusting. By halfway the snow covers the cabin walls, and when the context window is full the cabin is buried. After Claude compacts the conversation, the snow drops back to a dusting.

The backdrop draws in the Claude desktop app's Code tab and in the mobile app. The terminal doesn't draw backdrops.

## Install

At the prompt of a Claude Code session in a terminal:

```
/plugin install snowed-in --marketplace otollie/snowed-in
```

Answer `y` to add the marketplace, then press Enter to install it for your user. New sessions load the mod from then on.

From a shell:

```
claude plugin install snowed-in --marketplace otollie/snowed-in
```

In the desktop app, where `/plugin` doesn't run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `otollie/snowed-in`, then **Add plugin**.

## Notes

- The mod needs a recent Claude Code; older builds don't draw backdrops.
- Only one theme shows at a time, so another mod that sets a theme will replace this one.
