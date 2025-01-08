import { ContextMenuOptionDisabledOptionLabel } from "./context-menu";
import { updateStorage } from "../shared/storage";
import { ContextMenuOptionId } from "./context-menu";
import {
  onContentScriptPortMessageReceived,
  onSettingsPagePortMessageReceived
} from "./port/message-handlers";
import { onActionClicked } from "./action";

export async function onInstalled() {
  // Set default data on install
  const initialData = process.env.EXTENSION_STORAGE_INITIAL_DATA;

  if (initialData != null) {
    await updateStorage(JSON.parse(process.env.EXTENSION_STORAGE_INITIAL_DATA));
  }

  chrome.contextMenus.create({
    id: ContextMenuOptionId,
    title: ContextMenuOptionDisabledOptionLabel,
    enabled: false,
    contexts: ["selection"]
  });

  chrome.action.onClicked.addListener(onActionClicked);
}

export async function onReceivedConnection(port: chrome.runtime.Port) {
  console.log(`Background received connection from port ID '${port.name}'`);

  switch (port.name) {
    case "content-script":
      port.onMessage.addListener(onContentScriptPortMessageReceived);
      break;
    case "settings": {
      port.onMessage.addListener(onSettingsPagePortMessageReceived);
      break;
    }
    default:
      console.warn(`Unknown port '${port.name}'!`);
      break;
  }
}
