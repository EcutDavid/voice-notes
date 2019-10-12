export default {
  welcome: (nickname) => `Hello, ${nickname}`,
  apiWhiteListPrompt: () => "Sorry, this app is in the early test stage, only a small list of accounts are allowed to interacting with the APIs, please ask davidguandev@gmail.com to add your account, if you are interested to give it a go, thanks!",
  nonNotePrompt: () => "Thanks for using this app, please click \"submit new note\" to create your first note :)",
  errorCodePrompt: () => `Looks like something bad happened, please help this app by sending the link with error code(${location.href}) to davidguandev@gmail.com`
}
