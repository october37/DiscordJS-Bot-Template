const users = new Map();

const {
  Client,
  Collection,
  ActivityType,
  GatewayIntentBits,
  Events,
} = require('discord.js');

let config;
try {
  config = require('./config/config.json');
} catch {
  console.error(
    //@note: just in case user forget to rename the file.
    `Missing config file, make sure to remove "EXAMPLE" from config file!\nExitting!`,
  );
  return;
}

const commandHandler = require('./src/utils/commandHandler');
const eventHandler = require('./src/utils/eventHandler');
const componentHandler = require('./src/utils/componentHandler');
const client = new Client({
  intents: Object.values(GatewayIntentBits).reduce(
    (acc, intent) => acc | intent, //@note: found on stackoverflow, automatically getting every bot intent - in cost of performance.
    0,
  ),
});
const logHandler = require('./src/utils/logHandler');

client.commands = new Collection();
client.cooldowns = new Collection();

client.once(Events.ClientReady, async () => {
  logHandler.initialize(client);

  //@note: just in case not really needed
  if (client.user.bot == false) {
    console.log('Token is incorrect!');
  }

  console.log(`Logged in as ${client.user.displayName}`);

  //@note: sets bot's rich presence status
  client.user.setPresence({
    activities: [
      {
        name: `Discord JS Bot Template - https://github.com/october37`,
        type: ActivityType.Custom,
      },
    ],
    status: 'online',
  });

  //@note: initlaize handlers
  await commandHandler.loadCommands(client).catch(console.error);
  await eventHandler.loadEvents(client).catch(console.error);
  await componentHandler.loadComponents(client).catch(console.error);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isCommand()) {
    await commandHandler
      .synchronizeCommands(interaction, client)
      .catch(console.error);
  } else {
    await componentHandler
      .synchronizeComponent(interaction, client)
      .catch(console.error);
  }
});

module.exports = client;
client.login(config.token).catch(console.error);
