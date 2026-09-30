const { withMainActivity } = require("@expo/config-plugins");

module.exports = function withShareIntent(config) {
  return withMainActivity(config, (config) => {
    let contents = config.modResults.contents;

    if (contents.includes("handleSendIntent")) {
      return config;
    }

    const handlerCode = `
  override fun onNewIntent(intent: android.content.Intent?) {
    intent?.let { handleSendIntent(it) }
    setIntent(intent)
    super.onNewIntent(intent)
  }

  private fun handleSendIntent(intent: android.content.Intent?) {
    if (intent?.action == android.content.Intent.ACTION_SEND) {
      var text = intent.getStringExtra(android.content.Intent.EXTRA_TEXT)
        ?: intent.getCharSequenceExtra(android.content.Intent.EXTRA_TEXT)?.toString()
      if (text.isNullOrEmpty() && intent.clipData != null && intent.clipData!!.itemCount > 0) {
        val item = intent.clipData!!.getItemAt(0)
        text = item.text?.toString() ?: item.uri?.toString()
      }
      if (!text.isNullOrEmpty()) {
        try {
          val encoded = java.net.URLEncoder.encode(text, "UTF-8")
          intent.action = android.content.Intent.ACTION_VIEW
          intent.data = android.net.Uri.parse("frontend://share?url=$encoded")
        } catch (e: Exception) {
          e.printStackTrace()
        }
      }
    }
  }
`;

    if (contents.includes("super.onCreate(")) {
      contents = contents.replace(
        /super\.onCreate\([^)]*\)/,
        (match) => `handleSendIntent(intent)\n    ${match}`
      );
    }

    const lastBraceIndex = contents.lastIndexOf("}");
    if (lastBraceIndex !== -1) {
      contents =
        contents.slice(0, lastBraceIndex) +
        handlerCode +
        "\n" +
        contents.slice(lastBraceIndex);
    }

    config.modResults.contents = contents;
    return config;
  });
};
