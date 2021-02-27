use crate::error::ToolsError;
use crate::WikiClient;

pub async fn delete<C: AsRef<WikiClient>, S: AsRef<str>>(
    client: C,
    titles: &[S],
) -> Result<(), ToolsError> {
    let client = client.as_ref();

    for title in titles {
        log::debug!(
            "{:?}",
            client
                .post_into_text(&[
                    ("action", "delete"),
                    ("reason", "automated action"),
                    ("title", title.as_ref()),
                ])
                .await?
        );
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
    }

    Ok(())
}
