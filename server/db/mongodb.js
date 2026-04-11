import  { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
console.log("MONGO URL:", process.env.MONGO_URL);
const client = new MongoClient(process.env.MONGO_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function connectClus() {
  try {
    console.log('connecting to the cluster');
    await client.connect();
    console.log(`connected successfully`);

    db=client.db('solar_system');
    console.log(`connected to the database`);
  }catch(e){
    console.log(`error in mongodb: `,e.message);
  }
}

export {connectClus,db};