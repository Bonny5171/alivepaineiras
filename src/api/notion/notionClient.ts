import { Client } from "@notionhq/client";
import Config from 'react-native-config';

const option = { auth: Config.EXPO_PUBLIC_NOTION_READ_KEY }

const isDebug = Config.EXPO_PUBLIC_DEBUG === 'true';
if (isDebug) {
    option.logLevel = 'debug';
}

const notionClient = new Client(option);

export default notionClient;

