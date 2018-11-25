# wikibot
some standalone scripts for automated tasks on http://de.leagueoflegends.wikia.com

## Scripts
* No. 1: api_rotation.php
  * Called weekly via CRON-Job to update the wiki's champion rotation template with the new rotation fetched from Riot's API.
* No. 2: cdn_skinlink.php
  * redirects to the 3D-Skinviewer on [teemo.gg](https://www.teemo.gg/model-viewer) via [communitydragon](https://communitydragon.org) files.


## Helper Files:
* No. 1: champsById.json
  * json object to return a champion's name by its id.
  
  
  
## Upcoming:
* Handling of Response Codes from Riot's API (imo not really needed at the moment when called once per week)



# Important!
These scripts aren’t endorsed by Riot Games and don’t reflect the views or opinions of Riot Games
or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are
trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.