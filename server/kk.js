import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import pgk from 'pg';


dotenv.config();
const app=express();
const {Pool}=pgk;

app.use(cors());

async function start(){
    try{
        const pool = new Pool({
          user: "myuser",
          host: "localhost",
          database: "testdb",
          password: "mypassword",
          port: 5432,
        });
        await pool.connect();

        app.get('/',async(req,res)=>{
            const q=await pool.query(`SELECT * FROM profile`);
            res.json(q.rows);
        });
        app.post('/',async(req,res)=>{
            pool.query(`INSERT INTO profile(name,age)VALUES($1,$2) RETURNING *`[req.body.name,req.body.age]);
        });


        app.listen(process.env.PORT,()=>{console.log(`server started at http://localhost:${process.env.PORT}`)})
        
    }catch(e){
        console.log("error in server.js: ",e.message);
    }
}
