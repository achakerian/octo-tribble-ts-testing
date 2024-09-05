import { promptSubUUID } from "./openAIAPI";
import * as amqp from "amqplib";

// Define the function to encapsulate the RabbitMQ logic
export async function startMessageProcessor() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const receiveQueue = "BEtoAI";
    const sendQueue = "AItoBE";

    await channel.assertQueue(receiveQueue, { durable: false });
    await channel.assertQueue(sendQueue, { durable: false });

    console.log(
      ` [*] Waiting for messages in '${receiveQueue}'. To exit press CTRL+C`
    );
    channel.consume(receiveQueue, async (msg: amqp.ConsumeMessage | null) => {
      
      if (msg) {
        const content = msg.content.toString();
        const contentSplit = JSON.parse(content);
        console.log(
          ` [*] Received message ${contentSplit[1]}`, '\n', `[*] Waiting for messages in '${receiveQueue}'. To exit press CTRL+C`
        );
        const response = await promptSubUUID(
          "Generate five viva questions based on this document that assess: the student's understanding of the material, their ability to discuss the concepts, and their capacity to expand on the ideas.",
          contentSplit[0],
          contentSplit[1]
        );
        const sendMsg = Buffer.from(JSON.stringify([response[0],response[1]]));
        channel.sendToQueue(sendQueue, sendMsg);
        channel.ack(msg);

      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
}
//startMessageProcessor();

// ------------------- debugging --------------------//