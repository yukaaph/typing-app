/**
 * Web app entry point. Serves the single-page app shell (login screen +
 * main app are both in Index.html; client-side JS toggles between them).
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('設定確認表 Webポータル')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Used by Index.html to inline Stylesheet.html / JavaScriptClient.html. */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
