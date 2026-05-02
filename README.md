# RunStats unreleased
Runstats v2 mono repo

A TypeScript + Bun monorepo for integrating Strava activity events with Discord, allowing athletes to link their Strava accounts and automatically post rich Discord embeds when workouts are completed.

This repo is all the applications needed to start runstats. RunStats is a discord interface for strava. Users can see their activities, leaderboards, feats, and more. This will be built out to target containers and follow the [12 factor app](https://12factor.net/) methodology. 

## Hosted
This app will support portainer stack and docker compose. Eventually helm ... maybe.

docker-compose up -d

docker-compose down --rmi local


### Feature Set
- [x] User Registration
- [x] Publish Activities to Channel
- [ ] Summaries
    - [ ] Weekly
    - [ ] Monthly
    - [ ] Race
- [ ] Athlete Comparisons
- [ ] Admin Session Webpage
    - [ ] Per Guild Configuration
        - [ ] Summaries cron timing
        - [ ] Activity filter
        - [ ] Global detail filter
        - [ ] Channels
        - [ ] Unit(metric/mmperial) filter
- [ ] Commands
    - [ ] RunSignUp Queries
    - [ ] Vanish/Anon - no link, hide location, units based on guild location
    - [ ] Gear - users gear
    - [ ] Leaderboards - per stat
    - [ ] Races - view users races
- [ ] Non discord user registration
    - [ ] Comparisons

