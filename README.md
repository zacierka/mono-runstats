# RunStats unreleased
Runstats v2 mono repo

A TypeScript + Bun monorepo for integrating Strava activity events with Discord, allowing athletes to link their Strava accounts and automatically post rich Discord embeds when workouts are completed.

This repo is all the applications needed to start runstats. RunStats is a discord interface for strava. Users can see their activities, leaderboards, feats, and more. This will be built out to target containers and follow the [12 factor app](https://12factor.net/) methodology. 

## Hosted
This app will support portainer stack and docker compose. Eventually helm ... maybe.

docker-compose up -d

docker-compose down --rmi local
