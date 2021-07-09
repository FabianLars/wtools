use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(untagged)]
pub enum Edit {
    Succes { edit: Response },
    Failure { errors: Vec<super::Error> },
}

#[derive(Debug, Deserialize)]
pub struct Response {
    pub result: String,
    pub title: String,
}
