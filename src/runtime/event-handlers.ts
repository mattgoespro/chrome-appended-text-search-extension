import { ContextMenuOptionDisabledOptionLabel, getContextMenuOptionTitle } from "./context-menu";
import { updateStorage } from "../shared/storage";
import { ContextMenuOptionId } from "./context-menu";
import {
  onContentScriptPortMessageReceived,
  onPopupPortMessageReceived,
  onSettingsPagePortMessageReceived
} from "./port/message-handlers";
import { onActionClicked } from "./action";

export async function onInstalled() {
  // Set default data on install
  const contextMenuCreateProps: chrome.contextMenus.CreateProperties = {
    id: ContextMenuOptionId,
    title: ContextMenuOptionDisabledOptionLabel,
    enabled: false,
    contexts: ["selection"]
  };

  const initialData = JSON.parse(process.env.EXTENSION_STORAGE_INITIAL_DATA);

  if (initialData != null) {
    await updateStorage(initialData);
    contextMenuCreateProps.enabled = true;
    contextMenuCreateProps.title = getContextMenuOptionTitle("", initialData.appendedText);
  }

  chrome.contextMenus.create(contextMenuCreateProps);

  chrome.action.onClicked.addListener(onActionClicked);
}

export async function onReceivedConnection(port: chrome.runtime.Port) {
  console.log(`Background received connection from port '${port.name}'`);

  switch (port.name) {
    case "content-script":
      port.onMessage.addListener(onContentScriptPortMessageReceived);
      break;
    case "settings": {
      port.onMessage.addListener(onSettingsPagePortMessageReceived);
      break;
    }
    case "popup":
      port.onMessage.addListener(onPopupPortMessageReceived);
      break;
    default:
      console.warn(`Unknown port '${port.name}'!`);
      break;
  }
}
