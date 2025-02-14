import { RuntimePortMessageEvent } from "../shared/message-event";

chrome.runtime.getContexts({}).then((contexts) => {
  console.log(`${location.href}: content script contexts: `, contexts);
});

let port = chrome.runtime.connect({ name: "content-script" });

function log(...args: unknown[]) {
  console.log(`[chrome-appended-text-search] `, [...args, `Location: ${location.href}`].join("\n"));
}

document.addEventListener("mouseup", () => {
  const selectedText = document.getSelection().toString();

  if (selectedText == null || selectedText.trim() === "") {
    return;
  }

  const textSelectedMessage: RuntimePortMessageEvent<"content-script-text-selected"> = {
    type: "content-script-text-selected",
    source: "content-script",
    data: { selectedText: selectedText }
  };

  log(
    `Selected text: ${selectedText}`,
    `Sending message through port ${port.name}: `,
    textSelectedMessage
  );

  port.postMessage(textSelectedMessage);
});

port.onDisconnect.addListener(() => {
  log("Content script disconnected, reconnecting...");
  port = chrome.runtime.connect({ name: "content-script" });
});

window.onclose = () => {
  port.disconnect();
  log("Content script disconnected because the window was closed.");
};
