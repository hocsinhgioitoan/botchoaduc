import config from './config';
import { Client, PermissionFlagsBits, GuildMFALevel } from 'discord.js';
import axios from 'axios';
const data = async () => {
    const d = await axios.get(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
        {
            headers: {
                'X-CMC_PRO_API_KEY': config.apiKey,
            },
            params: {
                id: '1',
                convert: 'USD',
            },
        }
    );
    const c = d.data.data;
    return {
        price: c['1'].quote.USD.price.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        }),
        change: c['1'].quote.USD.percent_change_24h.toFixed(2),
    };
};
const client = new Client({ intents: 131071 });

client.once('ready', async (c) => {
    const d = await data();

    client.user?.setActivity({
        name: `${d.change > 0 ? '↗' : '↘'} ${d.change}%`,
    });
    c.guilds.cache.forEach(async (guild) => {
        const upRole = guild.roles.cache.find((role) => role.name === 'Up');
        const downRole = guild.roles.cache.find((role) => role.name === 'Down');
        const userPermisson = guild.members.me?.permissions.has(
            PermissionFlagsBits.ManageRoles
        );
        console.log(userPermisson)
        if (userPermisson) {
            if (guild.mfaLevel === GuildMFALevel.None) {
                if (!upRole) {
                    await guild.roles.create({
                        name: 'Up',
                        color: 'Green',
                    });
                } 
                if (!downRole) {
                    await guild.roles.create({
                        name: 'Down',
                        color: 'Red',
                    });
                }
            }
        }
        const upRole1 = guild.roles.cache.find((role) => role.name === 'Up');
        const downRole1 = guild.roles.cache.find(
            (role) => role.name === 'Down'
        );
        if (!upRole1) return;
        if (!downRole1) return;
        if (
            guild.members.me?.permissions.has(
                PermissionFlagsBits.ManageRoles
            )
        ) {
            if (d.change > 0) {
                if (guild.members.me?.roles.cache.has(downRole1.name))
                    await guild.members.me.roles.remove(downRole1);
                await guild.members.me?.roles.add(upRole1);
            } else {
                if (guild.members.me?.roles.cache.has(upRole1.name))
                    await guild.members.me.roles.remove(upRole1);
                await guild.members.me?.roles.add(downRole1);
            }
        }
    });
});
client.login(config.token);
