import * as amqp from "amqplib";
import { pdfToText } from "./extractPDF";
// ------------------- debugging --------------------//

(async () => {
    try {
        const connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();
    
        const sendQueue = "BEtoAI";
        const receiveQueue = "AItoBE";
    
        await channel.assertQueue(receiveQueue, { durable: false });
        await channel.assertQueue(sendQueue, { durable: false });
    
        // s represents the student submission
        const s = `
Nuclear physics is the study of atomic nuclei, their components, and the forces that govern their interactions. This field explores the fundamental forces of nature, particularly the strong nuclear force, which binds protons and neutrons within an atomic nucleus. One fascinating concept in nuclear physics is nuclear binding energy, the energy needed to break a nucleus into its separate protons and neutrons. This energy difference also corresponds to a mass difference, as described by Einstein’s equation, E=mc^2. Understanding these forces and energies helps explain why some atomic nuclei are stable while others undergo radioactive decay.

A key focus in nuclear physics is nuclear reactions, such as fission and fusion. Nuclear fission involves splitting a heavy nucleus into lighter nuclei, releasing a substantial amount of energy—a principle harnessed in nuclear power plants and atomic weapons. In contrast, nuclear fusion, which powers the sun and other stars, combines light nuclei, like hydrogen isotopes, to form heavier nuclei, releasing even greater amounts of energy. Achieving controlled fusion on Earth could provide a nearly limitless and clean energy source, but requires replicating the extreme conditions found in stars, presenting significant challenges.

Beyond energy, nuclear physics has numerous practical applications. In medicine, radioactive isotopes are used in imaging techniques like PET scans and in radiation therapy to target cancer cells. Radiocarbon dating, a tool in archaeology and geology, relies on the predictable decay of carbon-14 isotopes to determine the age of organic materials, aiding in historical and environmental research. Additionally, nuclear physics has contributed to the development of particle physics, offering insights into the fundamental particles and forces that shape our universe. These diverse applications highlight the profound impact of nuclear physics on both science and everyday life.
`;
        const u = "12345"; //represents the UUID
        const pdf = pdfToText('../PDFs/example.pdf')
        const sendMsg = Buffer.from(JSON.stringify([s,u]));        
        channel.sendToQueue(sendQueue, sendMsg);
        channel.consume(receiveQueue, async (msg: amqp.ConsumeMessage | null) => {
            if (msg) {
                console.log(` [x] Received '${msg.content.toString()}'`);
                channel.ack(msg);

            }
        });
    }
    catch (error){}
})();