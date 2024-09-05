import * as amqp from 'amqplib';
import { startMessageProcessor } from '../src/aiInterface'; // Adjust the import path as needed

// Mock the `amqplib` library
jest.mock('amqplib', () => {
  const amqpMock = {
    connect: jest.fn(),
    connectReturns: {
      createChannel: jest.fn(),
      close: jest.fn(),
    },
    channelReturns: {
      assertQueue: jest.fn(),
      consume: jest.fn(),
      sendToQueue: jest.fn(),
      ack: jest.fn(),
    },
  };
  amqpMock.connect.mockResolvedValue(amqpMock.connectReturns);
  amqpMock.connectReturns.createChannel.mockResolvedValue(amqpMock.channelReturns);
  return amqpMock;
});

describe('RabbitMQ Connection and Message Handling', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    // Mock console.log and console.error to suppress messages in test output
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('should successfully connect to RabbitMQ and process received messages', async () => {
    const { connect, channelReturns } = require('amqplib');

    // Mock the message processing behavior
    channelReturns.consume.mockImplementationOnce((queue: string, callback: (msg: amqp.ConsumeMessage | null) => void) => {
      const mockMessage = {
        content: Buffer.from(JSON.stringify({ document: "Test document" })),
      } as amqp.ConsumeMessage; // Explicitly typing the mock message

      // Call the callback to simulate message consumption
      callback(mockMessage);
    });

    await startMessageProcessor();

    // Check that connect and createChannel were called correctly
    expect(connect).toHaveBeenCalledWith('amqp://localhost');
    expect(connect().createChannel).toHaveBeenCalled();

    // Check that the queues were asserted
    expect(channelReturns.assertQueue).toHaveBeenCalledWith('BEtoAI', { durable: false });
    expect(channelReturns.assertQueue).toHaveBeenCalledWith('AItoBE', { durable: false });

    // Check that consume was called with the correct queue and callback
    expect(channelReturns.consume).toHaveBeenCalledWith('BEtoAI', expect.any(Function));

    // Check that sendToQueue was called with the processed message
    expect(channelReturns.sendToQueue).toHaveBeenCalledWith('AItoBE', expect.any(Buffer));

    // Check that ack was called to acknowledge the message
    expect(channelReturns.ack).toHaveBeenCalledWith(expect.any(Object));
  });

  test('should handle RabbitMQ connection failure gracefully', async () => {
    const { connect } = require('amqplib');

    // Mock the connection to reject with an error
    connect.mockRejectedValueOnce(new Error('Connection failed'));

    await expect(startMessageProcessor()).rejects.toThrow('Connection failed');
  });

  test('should log waiting for messages', async () => {
    await startMessageProcessor();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      " [*] Waiting for messages in 'BEtoAI'. To exit press CTRL+C"
    );
  });
});
