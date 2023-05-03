# 作るにあたっての参考資料やその手順などの記録

## Glitchプロジェクト作成
1\. 右上のNew projecからFind Moreをクリック
2\. Hello Nodeのリンクをクリック

## discord.js 13.x 対応
clientインスタンスの取得方法が変わったため、
以下のような修正が必要（v14.xでさらに変更されているようなので、それに合った修正が必要）

+ 修正前
```
const discord = require('discord.js');
const client = new discord.Client();
```

+ 修正後
```
const { Client, Intents } = require('discord.js');

const client = new Client({
  intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_TYPING] 
  ,partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER']
});
```

## Glitch / github 連携
Glitchに記述したコードをGitHubに連携を行い、コードの管理を行う
### 参考資料
[参照元](https://scrapbox.io/discordjs-japan/Glitch%E3%81%8B%E3%82%89GitHub%E3%81%AB%E3%82%BD%E3%83%BC%E3%82%B9%E3%82%B3%E3%83%BC%E3%83%89%E3%82%92%E3%82%A8%E3%82%AF%E3%82%B9%E3%83%9D%E3%83%BC%E3%83%88%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95 "GlitchからGitHubにソースコードをエクスポートする方法")

