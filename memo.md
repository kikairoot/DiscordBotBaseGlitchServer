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

// intents 操作権限
// partials 操作を行う対象
const client = new Client({
  intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_TYPING] 
  ,partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER']
});
```
### 参考資料
+ [Gateway Intents を指定するサンプル](https://scrapbox.io/discordjs-japan/Gateway_Intents_%E3%82%92%E6%8C%87%E5%AE%9A%E3%81%99%E3%82%8B%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB "Gateway Intents を指定するサンプル")
+ [Gateway Intentsの指定が必要になった](https://scrapbox.io/discordjs-japan/Gateway_Intents%E3%81%AE%E6%8C%87%E5%AE%9A%E3%81%8C%E5%BF%85%E8%A6%81%E3%81%AB%E3%81%AA%E3%81%A3%E3%81%9F "Gateway Intentsの指定が必要になった")
+ [Intentsに指定できる値](https://discord.js.org/#/docs/discord.js/v13/class/Intents "Intents")
+ [partialsに指定できる値](https://discord.js.org/#/docs/discord.js/v13/typedef/PartialType "PartialType")

## discord.js 14.x 対応(v13.x -> v14.x)
Glitchのライブラリv14.xに対応していたため変更することにした

1. package.jsonを選択
2. 上メニューのADD PACKAGEをクリックして、出てきたメニューからdiscord.jsの最新のものを選択
3. コードを修正（Clientインスタンス作成まわり）
```
const { 
  Client,
  GatewayIntentBits
} = require('discord.js');

// intents 操作権限
// partials 操作を行う対象
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages, 
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildMessageTyping
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER']
});
```
### 参考資料
+ [Gateway Intents を指定するサンプル](https://scrapbox.io/discordjs-japan/Gateway_Intents_%E3%82%92%E6%8C%87%E5%AE%9A%E3%81%99%E3%82%8B%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB "Gateway Intents を指定するサンプル")
+ [discord.jsのバージョンを13から14に移行する](https://qiita.com/tonnatorn/items/106fa502272196780e6b "discord.jsのバージョンを13から14に移行する")

## discord.js のバージョンアップによるNode.jsの依存バージョン対応(v14.x -> v14.x)
GlitchのNode.jsがv16.14.2のままアップデートされていないため、
npmアップデートでライブラリをアップデートしたら動かなくなってしまった。
```
/app/node_modules/undici/lib/web/fetch/response.js:530
  ReadableStream
  ^
ReferenceError: ReadableStream is not defined
    at Object.<anonymous> (/app/node_modules/undici/lib/web/fetch/response.js:530:3)
    at Module._compile (node:internal/modules/cjs/loader:1103:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1157:10)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Module.require (node:internal/modules/cjs/loader:1005:19)
    at require (node:internal/modules/cjs/helpers:102:18)
    at Object.<anonymous> (/app/node_modules/undici/lib/web/fetch/index.js:11:5)
    at Module._compile (node:internal/modules/cjs/loader:1103:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1157:10)
```

そのため、Node.jsがv16.14.2に対応したdiscord.jsにバージョンダウンさせることにした。

1. [NPMJS](https://www.npmjs.com/ "NPMJS")を開いて、discord.jsを検索する。
2. 古いパッケージから依存関係が問題ないバージョンを確認する。
3. Glichプロジェクトページの package.jsonを選択
4. コードを修正（discord.jsのバージョン）
```
  "dependencies": {
    "discord.js": "14.11.0",
    "@discordjs/builders": "1.8.2",
    "@discordjs/rest": "2.3.0",
    "@discordjs/collection": "1.5.3",
    "querystring": "0.2.1",
    "express": "^4.21.1",
    "npm": "^9.9.1"
  },
```

## Glitch / github 連携
Glitchに記述したコードをGitHubに連携を行い、コードの管理を行う

### 参考資料
[参照元](https://scrapbox.io/discordjs-japan/Glitch%E3%81%8B%E3%82%89GitHub%E3%81%AB%E3%82%BD%E3%83%BC%E3%82%B9%E3%82%B3%E3%83%BC%E3%83%89%E3%82%92%E3%82%A8%E3%82%AF%E3%82%B9%E3%83%9D%E3%83%BC%E3%83%88%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95 "GlitchからGitHubにソースコードをエクスポートする方法")



## Glitchサービス終了に伴い、Google CloudにNode.jsを立ち上げて移行する
1. google cloudにプロジェクトを作成
2. Node.jsを導入
3. 
### 参考資料
+ [Get started with Node.js](https://cloud.google.com/nodejs/getting-started)
+ [Start 02：Google Cloudのはじめかた](https://www.youtube.com/watch?v=VSk0uR4qGp4 "Start 02：Google Cloudのはじめかた")
