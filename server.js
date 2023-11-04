const http = require("http");
const querystring = require("querystring");
//const discord = require("discord.js");
const { 
  Client,
  GatewayIntentBits,
  ApplicationCommandOption,
  ApplicationCommandOptionType
} = require('discord.js');

// const client = new discord.Client();
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

// command
const nyan = {
  name:"nyan",
  description:"にゃ～ん",
};
const get_role_list = {
  name:"get_role_list",
  description:"get role list",
  options: [{
    type: 5, //BOOLEAN
    name: "view_id",
    description: "ID表示",
    required: false,
  }],
};

const test_guild_id = "341100652501532675";
const get_guild_role_list = {
  name:"get_guild_role_list",
  description:"get guild role list",
  options: [{
    type: ApplicationCommandOptionType.String, //
    name: "guild_id",
    description: "ID表示",
    required: true,
  },{
    type: ApplicationCommandOptionType.Boolean, //BOOLEAN
    name: "view_id",
    description: "ID表示",
    required: false,
  }],
};
const get_role_member = {
  name:"get_role_member",
  description:"get_role_member",
  options: [{
    type: 8, //role
    name: "role",
    description: "メンバー一覧を取得するロール",
    required: true,
  },{
    type: ApplicationCommandOptionType.Boolean, //BOOLEAN
    name: "view_id",
    description: "ID表示",
    required: false,
  }],
};
const commands = [nyan, get_role_list, get_role_member];
const guildCommands =[get_guild_role_list];
// 外部からのアクセス
http
  .createServer(function (req, res) {
    if (req.method == "POST") {
      var data = "";
      req.on("data", function (chunk) {
        data += chunk;
      });
      
      req.on("end", async function () {
        if (!data) {
          res.end("No post data");
          return;
        }
        var dataObject = querystring.parse(data);
        console.log("post:" + dataObject.type);
        
        // Glitchのサービスがスリープにならないよう外部から起こす部分
        if (dataObject.type == "wake") {
          console.log("Woke up in post");
          res.end();
          return;
        }

        // チャンネルへのメッセージ送信
        if (dataObject.type == "send") {
          sendMessage(dataObject);
        }
        // 個人へのダイレクトメッセージ送信
        if (dataObject.type == "sendDM") {
          sendDirectMessage(dataObject);
        }
        
        // Discordサーバの情報取得
        if (dataObject.type == "guilds") {
          let result = getGuilds(dataObject);
          
          console.log("request guilds");
          console.log(result);
          res.end(result);
          return;
        }
        // サーバロール一覧取得
        if (dataObject.type == "guildRole" || dataObject.type == "guildRoleByName") {
          let result = getGuildRole(dataObject);
          
          console.log("request guildRole");
          console.log(result);
          res.end(result);
          return;
        }
        // サーバロールに所属するメンバー一覧取得
        if (dataObject.type == "roleMembers") {
          let result = await getRoleMembers(dataObject);
          
          console.log("request roleMembers");
          console.log(result);
          res.end(result);
          return;
        }
        
        res.end();
      });
    } else if (req.method == "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Discord Bot is active now\n");
    }
  })
  .listen(3000);

client.on("ready", (message) => {
  console.log("Bot準備完了～");
  client.user.setPresence({ activity: { name: "げーむ" } });

  client.application.commands.set(commands)
  //.then(console.log)
  .catch(console.error);
  
});

// slash command resp
client.on("interactionCreate" ,async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'nyan') {
    await interaction.reply('にゃ～ん');
  }
  if (interaction.commandName === 'get_role_list') {
    let text = "name\n";
    if(interaction.guild == null){
      text = "サーバ専用コマンドです。";
    }else{
      const id = interaction.options.get("view_id");
      console.log(id);
      if(!id){
        text = "id," + text;
      }
      
      interaction.guild.roles.cache.forEach(role => {
        if(!id){
          text = text + role.id + ",";
        }
        text = text + role.name + "\n";
      });
    }
    await interaction.reply(text);
  }
  if (interaction.commandName === 'get_role_member') {
    let text = "nickname,displayName\n";
    if(interaction.guild == null){
      text = "サーバ専用コマンドです。";
    }else{
      const inputRole = interaction.options.get("role");
      console.log(inputRole.role.id);

      const id = interaction.options.get("view_id");
      console.log(id);
      if(!id){
        text = "id," + text;
      }
      

      await interaction.guild.members.fetch(); // member init (role member init)
      const role = interaction.guild.roles.cache.get(inputRole.role.id);
      role.members.forEach((member ,key,map) => {
          if(!id){
            text = text + member.id + ",";
          }
          text = text + member.nickname + "," + member.displayName + "\n";
        });
    }
    console.log(text);
    await interaction.reply(text);
  }
});

//　Discordのメッセージ送信に反応する
client.on("messageCreate", (message) => {
  console.log("message channel type text:" + message.channel.type );
  console.log("message content text:" + message.content );
  console.log("message.partial text:" + message.partial );
  if (message.author.id == client.user.id || message.author.bot) {
    return;
  }
  if (message.mentions.has(client.user)) {
    sendReply(message, "呼びましたか？");
    return;
  }
  
  console.log("message content text:" + message.content );
  if (message.content.match(/にゃ～ん|にゃーん/)) {
    let text = "にゃ～ん";
    console.log(text);
    sendMsg(message.channelId, text);
    return;
  }
});

if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.log("DISCORD_BOT_TOKENが設定されていません。");
  process.exit(0);
}

client.login(process.env.DISCORD_BOT_TOKEN);

function sendReply(message, text) {
  message
    .reply(text)
    .then(console.log("リプライ送信: " + text))
    .catch(console.error);
}

function sendMsg(channelId, text, option = {}) {
  client.channels.cache
    .get(channelId)
    .send(text, option)
    .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}
function sendMessage(dataObject){
  console.log("send request");
  if (dataObject.message != null) {
    if (dataObject.channelId != null) {
      console.log("channelId:" + dataObject.channelId);

      if(dataObject.userId != null){
        console.log("userId:" + dataObject.userId);

        client.users.fetch(dataObject.userId)
          .then(user => {
            let text = `${user}` + dataObject.message;
            console.log("user" + user);
            console.log("text" + text);
            sendMsg(dataObject.channelId, text);
          })
          .catch(console.error);

      }else{
        let text = dataObject.message;
        console.log("text" + text);
        sendMsg(dataObject.channelId, text);
      }
    }
  }
}
function sendDirectMessage(dataObject){
  console.log("sendDM request");
  if (dataObject.message != null) {
    if(dataObject.userId != null){
      console.log("userId:" + dataObject.userId);

      client.users.fetch(dataObject.userId)
        .then(user => {
          let text = dataObject.message;
          console.log("user" + user);
          console.log("text" + text);
          user.send(text);
        })
        .catch(console.error);
    }
  }
}

// get server name
function getGuilds(dataObject){
  let text = '{"data":';
  console.log("guilds list request");
  client.guilds.cache.forEach(guild => {
    console.log("guild(id,name):" + guild.id + "," + guild.name);
    text = text + '{"id":"' + guild.id + '","name":"' + guild.name + '"}';
  });
  text = text + "}";
  return text;
}

// get role list by server
function getGuildRole(dataObject){
  console.log("guild role request");
  var guild = null;
  if(dataObject.guildId != null){
    console.log("guildId:" + dataObject.guildId);
    guild = client.guilds.resolve(dataObject.guildId);
  }else if(dataObject.guildName != null){
    console.log("guildName:" + dataObject.guildName);
    guild = client.guilds.cache.find(guild => guild.name == dataObject.guildName);
  }
  
  if(guild != null){
    let data = "";
    console.log("guild(id,name):" + guild.id + "," + guild.name);
    guild.roles.cache.forEach(role => {
      console.log("role(id.name):" + role.id + "," + role.name);

      if(data != ""){
        data = data + ",";
      }
      data = data + '{"id":"' + role.id + '","name":"' + role.name + '"}';
    });
    let text = '{"data":[' + data + "]}";
    return text;
  }
  return "{}";
}

// メンバー一覧取得時に動作の確定が必要なため、asyncが必要
async function getRoleMembers(dataObject){
  console.log("role members request");
  var guild = null;
  if(dataObject.guildId != null){
    console.log("guildId:" + dataObject.guildId);
    guild = client.guilds.cache.get(dataObject.guildId);
  }else if(dataObject.guildName != null){
    console.log("guildName:" + dataObject.guildName);
    guild = client.guilds.cache.find(guild => guild.name == dataObject.guildName);
  }
  
  if(guild != null){
    console.log("guild(id,name):" + guild.id + "," + guild.name);
    var role = null;

    // ロールメンバー一覧は、サーバのメンバー一覧取得をしておかないと名前が取得できない（外部呼出しの場合）
    await guild.members.fetch(); // member init (role member init)

    if(dataObject.roleId != null){
      console.log("roleId:" + dataObject.roleId);
      role = guild.roles.cache.find(role => role.id == dataObject.roleId);
    }else if(dataObject.roleName){
      console.log("roleName:" + dataObject.roleName);
      role = guild.roles.cache.find(role => role.name == dataObject.roleName);
    }
    if(role != null){
      console.log("role(id.name):" + role.id + "," + role.name);
      console.log("members:" + role.members);
      console.log("members size:" + role.members.size);

      let data = "";
      role.members.forEach((member ,key,map) => {
        console.log("role member(id.name,displayName):" + member.id + "," + member.nickname + "," + member.displayName);

        if(data != ""){
          data = data + ",";
        }
        data = data + '{"id":"' + member.id + '","name":"' + member.nickname + '","displayName":"' + member.displayName + '"}';
      });

      console.log(data);
      let text = '{"data":[' + data + "]}";
      console.log(text);
      return text;
    }
  }
  return "{}";
}