# d.js-v14-Anti-Link-System
This repository includes an anti-link mechanism for your Discord bot, with the ability to set and disable it for your Discord server, and a log channel.

### `❓` **Purpose:**
This is an anti-link system with buttons that allow you to enable and disable it for your server, as well as the ability to record any violations in a specified channel.

### `⚠️` **Warning:**
When copying over the files from this repository, remember to adjust the file paths to match the files on your bot. Also remember to modify the embed colors to your preference.

### `❗` **Requirements:**
You need the antilink and antilinkLogChannel schema for this command to work.

**⤷ Location:** [d.js-v14-Anti-Link-System/Models/antilink.js](https://github.com/sharpenhead/d.js-v14-Anti-Link-System/blob/main/Models/antilink.js)

**⤷ Location:** [d.js-v14-Anti-Link-System/Models/antilinkLogChannel.js](https://github.com/sharpenhead/d.js-v14-Anti-Link-System/blob/main/Models/antilinkLogChannel.js)

**⤷** `📁` Place these two in the folder where you keep all your schemas.

**──────────────────────**

Finally, you need the messageCreate event.

**⤷ Location:** [d.js-v14-Anti-Link-System/Events/Client/messageCreate.js](https://github.com/sharpenhead/d.js-v14-Anti-Link-System/blob/main/Events/Client/messageCreate.js)

**⤷** `📁` Place in `Events > Client`.

### `🔧` **Command:**
- /setup-antilink **➜** Allows admins to enable or disable the anti-link system.

### `💳` **Credits:**
- Credits to Jackson.#0001 (Discord ID: 735141652506607716) for including the bypass permissions option in the setup command.
- Credits to shoczy#9003 (Discord ID: 709393455519891486) for providing the foundation for the enable and disable system.
- Credits to Technologypower#3174 (Discord ID: 890255508693454929) for presenting the timeout and kick button actions in the log embed.

### `📝` **Side note:**
Please contact me via Discord, RexoPlays's brother#3085, if you have any questions, problems with the system, or if a step is unclear, and I will try my best to assist you!
