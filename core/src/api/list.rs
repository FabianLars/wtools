use std::collections::HashMap;

use anyhow::Result;
use serde_json::Value;

use crate::WikiClient;

pub async fn allimages<C: AsRef<WikiClient>>(client: C) -> Result<Vec<String>> {
    get_from_api(client.as_ref(), "allimages", "ai", None).await
}

pub async fn allpages<C: AsRef<WikiClient>>(
    client: C,
    parameter: Option<&str>,
) -> Result<Vec<String>> {
    let namespaces = vec![
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15",
        "110", "111", "1200", "1201", "1202", "2000", "2001", "2002", "500", "501", "502", "503",
        "828", "829",
    ];
    let client = client.as_ref();

    if let Some(param) = parameter {
        if param == "all" {
            let mut temp: Vec<String> = Vec::new();
            for ns in namespaces {
                temp.append(
                    &mut get_from_api(
                        client,
                        "allpages",
                        "ap",
                        Some(&format!("apnamespace={}", ns)),
                    )
                    .await?,
                );
            }
            return Ok(temp);
        } else if namespaces.iter().any(|x| *x == param) {
            return get_from_api(
                client,
                "allpages",
                "ap",
                Some(&format!("apnamepsace={}", param)),
            )
            .await;
        } else {
            panic!(format!("Unknown namespace given: {}", param));
        }
    }
    get_from_api(client, "allpages", "ap", None).await
}

pub async fn alllinks<C: AsRef<WikiClient>>(client: C) -> Result<Vec<String>> {
    get_from_api(client.as_ref(), "alllinks", "al", None).await
}

pub async fn allcategories<C: AsRef<WikiClient>>(client: C) -> Result<Vec<String>> {
    get_from_api(client.as_ref(), "allcategories", "ac", None).await
}

pub async fn backlinks<C: AsRef<WikiClient>>(
    client: C,
    parameter: Option<&str>,
) -> Result<Vec<String>> {
    if parameter.is_none() {
        panic!("Missing btitle (Title to search)")
    }
    get_from_api(client.as_ref(), "backlinks", "bl", parameter).await
}

pub async fn categorymembers<C: AsRef<WikiClient>>(
    client: C,
    parameter: Option<&str>,
) -> Result<Vec<String>> {
    if parameter.is_none() {
        panic!("missing cmtitle (Which category to enumerate (must include 'Category:' prefix))")
    }
    get_from_api(client.as_ref(), "categorymembers", "cm", parameter).await
}

pub async fn embeddedin<C: AsRef<WikiClient>>(
    client: C,
    parameter: Option<&str>,
) -> Result<Vec<String>> {
    if parameter.is_none() {
        panic!("missing eititle: Title to search")
    }
    get_from_api(client.as_ref(), "embeddedin", "ei", parameter).await
}

pub async fn imageusage<C: AsRef<WikiClient>>(
    client: C,
    parameter: Option<&str>,
) -> Result<Vec<String>> {
    if parameter.is_none() {
        panic!("missing iutitle: Title to search")
    }
    get_from_api(client.as_ref(), "imageusage", "iu", parameter).await
}

pub async fn iwbacklinks<C: AsRef<WikiClient>>(
    client: C,
    parameter: Option<&str>,
) -> Result<Vec<String>> {
    if parameter.is_none() {
        panic!("missing iwblprefix: Prefix for the interwiki")
    }
    get_from_api(client.as_ref(), "iwbacklinks", "iwbl", parameter).await
}

pub async fn langbacklinks<C: AsRef<WikiClient>>(
    client: C,
    parameter: Option<&str>,
) -> Result<Vec<String>> {
    if parameter.is_none() {
        panic!("missing lbllang: Language for the language link")
    }
    get_from_api(client.as_ref(), "langbacklinks", "lbl", parameter).await
}

pub async fn search<C: AsRef<WikiClient>>(
    client: C,
    parameter: Option<&str>,
) -> Result<Vec<String>> {
    if parameter.is_none() {
        panic!("missing srsearch: Search for all page titles (or content) that has this value")
    }
    get_from_api(client.as_ref(), "search", "sr", parameter).await
}

pub async fn exturlusage<C: AsRef<WikiClient>>(client: C) -> Result<HashMap<String, Vec<String>>> {
    let client = client.as_ref();
    let mut has_next: bool = true;
    let mut continue_from = String::new();
    let mut results: HashMap<String, Vec<String>> = HashMap::new();

    while has_next {
        let json: Value = client
            .request_json(&[
                ("action", "query"),
                ("format", "json"),
                ("list", "exturlusage"),
                ("eulimit", "5000"),
                ("euoffset", &continue_from),
            ])
            .await?;

        for x in json["query"]["exturlusage"].as_array().unwrap().iter() {
            let title = x["title"].as_str().unwrap().to_string();
            let url = x["url"].as_str().unwrap().to_string();

            results.entry(title).or_insert_with(Vec::new).push(url);
        }

        match json.get("query-continue") {
            None => has_next = false,
            Some(_) => {
                continue_from = json["query-continue"]["exturlusage"]["euoffset"]
                    .as_i64()
                    .unwrap()
                    .to_string()
            }
        }
    }

    Ok(results)
}

pub async fn protectedtitles<C: AsRef<WikiClient>>(client: C) -> Result<Vec<String>> {
    get_from_api(client.as_ref(), "protectedtitles", "pt", None).await
}

pub async fn querypage<C: AsRef<WikiClient>>(
    client: C,
    parameter: Option<&str>,
) -> Result<Vec<String>> {
    if parameter.is_none() {
        panic!("missing qppage: The name of the special page. Note, this is case sensitive")
    }
    get_from_api(client.as_ref(), "querypage", "qp", parameter).await
}

pub async fn wkpoppages<C: AsRef<WikiClient>>(client: C) -> Result<Vec<String>> {
    get_from_api(client.as_ref(), "wkpoppages", "wk", None).await
}

pub async fn unconvertedinfoboxes<C: AsRef<WikiClient>>(client: C) -> Result<Vec<String>> {
    get_infobox_lists(client.as_ref(), "unconvertedinfoboxes").await
}

pub async fn allinfoboxes<C: AsRef<WikiClient>>(client: C) -> Result<Vec<String>> {
    get_infobox_lists(client.as_ref(), "allinfoboxes").await
}

async fn get_from_api(
    api: &WikiClient,
    long: &str,
    short: &str,
    parameter: Option<&str>,
) -> Result<Vec<String>> {
    let mut has_next: bool = true;
    let mut continue_from = String::new();
    let mut results: Vec<String> = Vec::new();
    let getter = match short {
        "ac" => "*",
        _ => "title",
    };
    let from = match short {
        "eu" => "offset",
        _ => "from",
    };
    let param = match parameter {
        Some(p) => {
            let temp: Vec<&str> = p.split('=').collect();
            (temp[0], temp[1])
        }
        None => ("", ""),
    };

    while has_next {
        let json: Value = api
            .request_json(&[
                ("action", "query"),
                ("format", "json"),
                ("list", long),
                (&format!("{}limit", short), "5000"),
                (&format!("{}{}", short, from), &continue_from),
                param,
            ])
            .await?;
        if json["query"][long].is_object() {
            for (_, x) in json["query"][long].as_object().unwrap().iter() {
                results.push(x[getter].as_str().unwrap().to_string())
            }
        } else if json["query"][long].is_array() {
            for x in json["query"][long].as_array().unwrap().iter() {
                results.push(x[getter].as_str().unwrap().to_string())
            }
        }

        match json.get("query-continue") {
            None => has_next = false,
            Some(_) => {
                continue_from =
                    match json["query-continue"][long][format!("{}{}", short, from)].as_str() {
                        Some(x) => x.to_string(),
                        None => json["query-continue"][long][format!("{}{}", short, from)]
                            .as_i64()
                            .unwrap()
                            .to_string(),
                    };
            }
        }
    }

    Ok(results)
}

async fn get_infobox_lists(api: &WikiClient, typ: &str) -> Result<Vec<String>> {
    let mut results: Vec<String> = Vec::new();

    let json: Value = api
        .request_json(&[("action", "query"), ("format", "json"), ("list", typ)])
        .await?;

    for x in json["query"][typ].as_array().unwrap().iter() {
        results.push(x["title"].as_str().unwrap().to_string())
    }

    Ok(results)
}