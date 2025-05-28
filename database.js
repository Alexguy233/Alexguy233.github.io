//DB setup
//import stuff from postgre the pool and client connection types
//There is a table named users with a firstname and lastname
//varchar(12)
/*

DEPRECEATED: This code serves no purpose
and i'll delete it later. Earlier draft I
still copy paste from sometimes

export function addUser(firstName, lastName){
const path = require('path');
require('dotenv').config({
    override: true,
    path: path.join(__dirname, 'development.env')
});
const {Pool, Client} = require('pg');

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT
});

//create a connection and add user to db

(async()=> {
    const client = await pool.connect();
    try{
    await client.query('insert into users(firstname, lastname) values (\''+firstName+'\', \''+lastName+'\');')    
    const {rows} = await client.query('SELECT current_user')
    const currentUser = rows[0]['current_user']
    console.log(currentUser)
    } catch (err) {
        console.error(err);
    } finally{
        client.release();
    }
})();
}
//
*/