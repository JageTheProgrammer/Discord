import { SlashCommandBuilder } from 'discord.js';
import tls from 'node:tls';

function checkSSL(host) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(443, host, { servername: host, timeout: 5000 }, () => {
      const cert = socket.getPeerCertificate(true);
      socket.end();
      resolve(cert);
    });
    socket.on('error', reject);
    socket.on('timeout', () => { socket.destroy(new Error('Timeout')); });
  });
}

export default {
  data: new SlashCommandBuilder()
    .setName('ssl')
    .setDescription('Check SSL certificate info')
    .addStringOption(o => o.setName('host').setDescription('Hostname (example.com)').setRequired(true)),
  async execute(interaction) {
    const host = interaction.options.getString('host');
    await interaction.deferReply({ ephemeral: true });
    try {
      const cert = await checkSSL(host);
      const out = {
        subject: cert.subject,
        issuer: cert.issuer,
        valid_from: cert.valid_from,
        valid_to: cert.valid_to,
        fingerprint256: cert.fingerprint256,
      };
      await interaction.editReply({ content: `\`\`\`json\n${JSON.stringify(out, null, 2)}\n\`\`\`` });
    } catch (e) {
      await interaction.editReply({ content: 'SSL check failed.' });
    }
  },
};

