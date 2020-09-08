# Three Bar Play Trading Bot
This repo contains automated trading bot code that searches for simple Three-Bar-Play trade opportunities at market open. A **Three Bar Play** describes an event in which a particular stock exhibits an igniting bar, followed by a resting bar, and then an entry bar - the signal its time to buy. The pattern can also be extended to a "**Four Bar Play**."

![Three Bar Play Diagram](./utils/3barplay.png "Three Bar Play")

>The Three-Bar-Play bot is encapsulated in a container and deployed to a Fargate Cluster. An AWS Step Function that operates on a cron schedule invokes the Fargate task and starts up the bot. 
>Market data and trading operations are handled by [Alpaca - commission free stock trading API.](https://alpaca.markets/)

# Next Steps
- Target specific stocks in a watch-list
- Implement buy - sell execution flow
- Add new strategy nodes to the Fargate Cluster
