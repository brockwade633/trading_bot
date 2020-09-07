# Trading Bot
This repo contains automated trading bot code that searches for simple Three-Bar-Play trade opportunities at market open. 

>The Three-Bar-Play bot is encapsulated in a container and deployed to a Fargate Cluster. An AWS Step Function that operates on a cron schedule invokes the Fargate task and starts up the bot. 
>Market data and trading operations are handled by [Alpaca - commission free stock trading API.](https://alpaca.markets/)

# Next Steps
- Implement buy - sell execution flow
- Add new strategy nodes to the Fargate Cluster
