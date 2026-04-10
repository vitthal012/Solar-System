import express from 'express';
import { connectClus,db } from './db/mongodb.js';
import dotenv from 'dotenv';
import cors from 'cors';

const app=express();

dotenv.config();
app.use(express.json());
app.use(cors());

async function start(){
    try{
        await connectClus();

        app.get('/',(req,res)=>{
            res.json({"hello":"vitthal"});
        });

        app.get('/components',async (req,res)=>{
            let collect =await db.collection('components').find().toArray();
            res.json(collect[0]);
        });

        app.listen(process.env.PORT||8000,()=>{
            console.log(`Server started at http://localhost:${process.env.PORT||8000}`);
        })


    }catch(e){
        console.log(`error at server.js: `,e.message);
    }
}
start();