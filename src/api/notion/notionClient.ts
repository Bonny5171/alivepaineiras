import { Client } from "@notionhq/client";

const option = { auth: process.env.EXPO_PUBLIC_NOTION_READ_KEY }

const isDebug = process.env.EXPO_PUBLIC_DEBUG === 'true';
if (isDebug) {
    option.logLevel = 'debug';
}

const notionClient = new Client(option);

export default notionClient;

