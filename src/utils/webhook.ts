import { Webhook, MessageBuilder } from 'discord-webhook-node';
import dotenv from 'dotenv';
dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});

export const sendWebhook = async (err: any, hint: string) => {
  const where = err.where ? err.where : 'unknown';
  const information = err.information ? err.information : 'unknown';
  const error = err.error ? err.error : err;

  const embed = new MessageBuilder()
    .setTitle(`${where}`)
    .addField('Information', JSON.stringify(information))
    .addField('Hint', hint)
    .addField('Full story', JSON.stringify(error))
    .setTimestamp()
    .setColor(15548997);

  const hook = new Webhook(process.env.WEBHOOK_URL as string);

  await hook.send(embed);
};
