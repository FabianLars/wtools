# mw-toolbox

some tools to interact with http://leagueoflegends.fandom.com/de/wiki/
uses limited editing rate of ~1-2 edits per second according to fandoms rules
Interaction with Riot's API only via CLI + feature flag "riot-api" (just "update rotation" for now)

Input files need to be formatted with newline seperation (eg 1 wiki article per line)

-   GUI usage (development):
    -   cd into gui subdir
    -   run "pnpm|yarn|npm install"
    -   run "pnpm|yarn|npm start" to start the dev server
    -   run "pnpm|yarn|npm tauri dev" to start the tauri app
-   CLI usage (development):
    -   run via "cargo run \<command\> (\<args if needed\>)"
        -   these commands need FANDOM_BOT_NAME, FANDOM_BOT_PASSWORD and/or RIOT_API_KEY (depends on command) environment variables as of now
            -   Fandom login data can be provided via:
                "cargo run [--loginname \<name\>|-n \<name\>] and [--loginpassword \<pw\>|-p \<pw\>]"
        -   example: "cargo run delete ../todelete.txt"
            -   deletes every page listed in specified file (separation via newline)

# Important!

This project isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends.
League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.

Same for Fandom and MediaWiki btw...
