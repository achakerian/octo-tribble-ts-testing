npm init -y
npx tsc --init
npm install typescript ts-node --save-dev
npm install jest @types/jest ts-jest --save-dev
npm install @types/node --save-dev
npx ts-node .ts

npm install dotenv zod openai amqplib pdf-parse @google/generative-ai 
npm i --save-dev @types/amqplib
npm i --save-dev @types/pdf-parse

octo-tribble-ts-testing/
│
├── src/                       # Source code directory
│   ├── openAIAPI.ts               # Example TypeScript file
│   └── ...                    # Other TypeScript files
│
├── tests/                     # Test directory
│   ├── openAIAPI.test.ts      # Example test file for index.ts
│   └── ...                    # Other test files
│
├── node_modules/              # npm dependencies
│
├── jest.config.js             # Jest configuration file
│
├── tsconfig.json              # TypeScript configuration file
│
├── package.json               # npm project metadata
│
└── ...                        # Other configuration or metadata files
