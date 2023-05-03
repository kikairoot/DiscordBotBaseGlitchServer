const http = require("http");
const querystring = require("querystring");
//const discord = require("discord.js");
const { Client, Intents } = require('discord.js');

// const client = new discord.Client();
const client = new Client({
  intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_TYPING] 
  ,partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER']
});

http
  .createServer(function (req, res) {
    if (req.method == "POST") {
      var data = "";
      req.on("data", function (chunk) {
        data += chunk;
      });
      req.on("end", function () {
        if (!data) {
          res.end("No post data");
          return;
        }
        var dataObject = querystring.parse(data);
        console.log("post:" + dataObject.type);
        if (dataObject.type == "wake") {
          console.log("Woke up in post");
          res.end();
          return;
        }

        if (dataObject.type == "send") {
          sendMessage(dataObject);
        }
        if (dataObject.type == "sendDM") {
          sendDirectMessage(dataObject);
        }
        if (dataObject.type == "guilds") {
          getGuilds(dataObject);
        }
        if (dataObject.type == "guildRole" || dataObject.type == "guildRoleByName") {
          getGuildRole(dataObject);
        }
        if (dataObject.type == "roleMembers") {
          getRoleMembers(dataObject);
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
});

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
  
  if (message.content.match(/^get_role_member_csv /)){
    message.guilds.cache.get();

    var guild = client.guilds.cache.get(dataObject.guildId);
    if(guild != null){
      console.log("guild(id,name):" + guild.id + "," + guild.name);

      guild.members.fetch(); // member init (role member init)
      guild.roles.fetch(dataObject.roleId)
        .then(role => {
          console.log("role(id.name):" + role.id + "," + role.name);
          console.log("members:" + role.members);
          console.log("members size:" + role.members.size);

          role.members.forEach((member ,key,map) => {
            console.log("role member(id.name,displayName):" + member.id + "," + member.nickname + "," + member.displayName);
          });
        })
        .catch(console.error);

    }
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
function getGuilds(dataObject){
  console.log("guilds list request");
  client.guilds.cache.forEach(guild => {
    console.log("guild(id,name):" + guild.id + "," + guild.name);
  });
}
function getGuildRole(dataObject){
  console.log("guild role request");
  if(dataObject.guildId != null){
    console.log("guildId:" + dataObject.guildId);

    var guild = client.guilds.resolve(dataObject.guildId);
    if(guild != null){
      console.log("guild(id,name):" + guild.id + "," + guild.name);
      guild.roles.cache.forEach(role => {
        console.log("role(id.name):" + role.id + "," + role.name);
      });
    }
  }
}

async function getRoleMembers(dataObject){
  console.log("role members request");
  if(dataObject.guildId != null){
    console.log("guildId:" + dataObject.guildId);

    if(dataObject.roleId != null){
      console.log("roleId:" + dataObject.roleId);
      

      var guild = client.guilds.cache.get(dataObject.guildId);
      if(guild != null){
        console.log("guild(id,name):" + guild.id + "," + guild.name);
        
        await guild.members.fetch(); // member init (role member init)
        guild.roles.fetch(dataObject.roleId)
          .then(role => {
            console.log("role(id.name):" + role.id + "," + role.name);
            console.log("members:" + role.members);
            console.log("members size:" + role.members.size);
          
            role.members.forEach((member ,key,map) => {
              console.log("role member(id.name,displayName):" + member.id + "," + member.nickname + "," + member.displayName);
            });
          })
          .catch(console.error);

      }
    }
  }
}