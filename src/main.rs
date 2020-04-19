// TODO: (global) Consider Tokio file writing/reading
// TODO: (global) Refactoring/Cleanup
use clap::{arg_enum, Clap};

use crate::{ commands::{ delete::*, list::*, rename::*, upload::* }, util::props::* };
#[cfg(feature = "league")]
use crate::commands::league::*;
#[cfg(feature = "skylords")]
use crate::commands::skylords::*;

mod commands;
mod util;
#[cfg(feature = "gui")]
mod gui;

#[derive(Clap, Debug)]
enum Subcommand {
    Delete {
        /// uses newline seperation
        #[clap(parse(from_os_str))]
        input: std::path::PathBuf,
    },
    List {
        list_type: ListType,

        parameter: Option<String>,

        #[clap(short, long, parse(from_os_str))]
        output: Option<std::path::PathBuf>,
    },
    Move {
        /// uses newline seperation
        #[clap(parse(from_os_str))]
        input: std::path::PathBuf,
    },
    League {
        league_type: LeagueType,

        #[clap(short, long, parse(from_os_str))]
        path: Option<std::path::PathBuf>,
    },
    Skylords {
        skylords_type: SkylordsType,

        #[clap(short, long, parse(from_os_str))]
        path: Option<std::path::PathBuf>,
    },
    Upload {
        #[clap(parse(from_os_str))]
        input: std::path::PathBuf,
    },
}

arg_enum! {
    #[derive(Debug)]
    enum LeagueType {
        Champs,
        Champions,
        Discount,
        Discounts,
        Rotation,
        Rotations,
        Set
    }
}

arg_enum! {
    #[derive(Debug)]
    enum SkylordsType {
        Champs,
        Champions,
        Discount,
        Discounts,
        Rotation,
        Rotations,
        Set
    }
}

arg_enum! {
    #[derive(Debug)]
    enum ListType {
        Allimages,
        Allpages,
        Alllinks,
        Allcategories,
        Backlinks,
        Categorymembers,
        Embeddedin,
        Imageusage,
        Iwbacklinks,
        Langbacklinks,
        Search,
        Exturlusage,
        Protectedtitles,
        Querypage,
        Wkpoppages,
        Unconvertedinfoboxes,
        Allinfoboxes
    }
}

#[derive(Clap, Debug)]
struct Cli {
    #[clap(subcommand)]
    command: Option<Subcommand>,

    #[clap(short = "n", long, env = "FANDOM_BOT_NAME")]
    loginname: String,
    #[clap(short = "p", long, env = "FANDOM_BOT_PASSWORD")]
    loginpassword: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    match Cli::parse().command {
        #[cfg(not(feature = "gui"))]
        None => (),
        #[cfg(feature = "gui")]
        None => gui::start(),
        Some(x) => match x {
            Subcommand::Delete { .. } => {
                delete_pages(Props::from_delete(Cli::parse())).await?
            }
            Subcommand::List { list_type, .. } => match list_type {
                ListType::Allimages => {
                    allimages(Props::from_list(Cli::parse())).await?
                }
                ListType::Allpages => {
                    allpages(Props::from_list(Cli::parse())).await?
                }
                ListType::Alllinks => {
                    alllinks(Props::from_list(Cli::parse())).await?
                }
                ListType::Allcategories => {
                    allcategories(Props::from_list(Cli::parse())).await?
                }
                ListType::Backlinks => {
                    backlinks(Props::from_list(Cli::parse())).await?
                }
                ListType::Categorymembers => {
                    categorymembers(Props::from_list(Cli::parse())).await?
                }
                ListType::Embeddedin => {
                    embeddedin(Props::from_list(Cli::parse())).await?
                }
                ListType::Imageusage => {
                    imageusage(Props::from_list(Cli::parse())).await?
                }
                ListType::Iwbacklinks => {
                    iwbacklinks(Props::from_list(Cli::parse())).await?
                }
                ListType::Langbacklinks => {
                    langbacklinks(Props::from_list(Cli::parse())).await?
                }
                ListType::Search => commands::list::search(Props::from_list(Cli::parse())).await?,
                ListType::Exturlusage => {
                    exturlusage(Props::from_list(Cli::parse())).await?
                }
                ListType::Protectedtitles => {
                    protectedtitles(Props::from_list(Cli::parse())).await?
                }
                ListType::Querypage => {
                    querypage(Props::from_list(Cli::parse())).await?
                }
                ListType::Wkpoppages => {
                    wkpoppages(Props::from_list(Cli::parse())).await?
                }
                ListType::Unconvertedinfoboxes => {
                    unconvertedinfoboxes(Props::from_list(Cli::parse())).await?
                }
                ListType::Allinfoboxes => {
                    allinfoboxes(Props::from_list(Cli::parse())).await?
                }
            },
            Subcommand::Move { .. } => {
                move_pages(Props::from_move(Cli::parse())).await?
            }
            #[cfg(not(feature = "league"))]
            Subcommand::League { .. } => panic!("Did you forget to set the league feature flag?"),
            #[cfg(feature = "league")]
            Subcommand::League { league_type, .. } => match league_type {
                LeagueType::Champs | LeagueType::Champions => champs().await?,
                LeagueType::Discount | LeagueType::Discounts => discounts(Props::from_league(Cli::parse())).await?,
                LeagueType::Rotation | LeagueType::Rotations => {
                    #[cfg(not(feature = "riot-api"))]
                    panic!("Did you forget to set the riot-api feature flag?");
                    #[cfg(feature = "riot-api")]
                    rotation(Props::from_league(Cli::parse())).await?
                },
                LeagueType::Set => set(Props::from_league(Cli::parse())).await?,
            },
            Subcommand::Upload { .. } => {
                upload(Props::from_upload(Cli::parse())).await?
            }
        },
    }
    Ok(())
}