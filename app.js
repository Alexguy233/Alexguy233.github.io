const http = require('node:http');
const fs = require('node:fs');
const url = require('node:url');
const pg = require('pg');

var blockno;
var pid;

// const hostname = 'https://cognition-a0e89b43ca6a.herokuapp.com/' || 'localhost';
const port = process.env.PORT || 8080;

const pgClient = new pg.Client({
	connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/VoiceBank',
	ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
	//ssl: process.env.DATABASE_URL ? true : false

	//comment below code in localhost
	/*
	ssl: {
		require: true,
		rejectUnauthorized: false
	}*/
});

pgClient.connect(err => {
	if (err) {
		// Log error if connection fails
		console.error('Connection to PostgreSQL failed:', err.stack);
	} else {
		// Log success message if connection is successful
		console.log('Connected to PostgreSQL');
	}
});
const server = http.createServer((req, res) => {
	//console.log(`Incoming request: ${req.method} ${req.url}`);
    const pathname = url.parse(req.url).pathname;

    // Function to serve files
	const serveFile = (filePath, contentType) => {
		fs.readFile(filePath, (err, data) => {
			if (err) {
				console.error(err.stack);
				res.writeHead(500, { 'Content-Type': 'text/plain' });
				res.end('500 Internal Server Error');
			} else {
				res.writeHead(200, { 'Content-Type': contentType });
				res.end(data);
			}
		});
	};
    if (req.method === 'GET') {
		if (pathname === '/') {
            serveFile('./index.html', 'text/html; charset=utf-8');
        }
        else if (pathname === '/initialPrototype.css'){
            serveFile('./initialPrototype.css', 'text/css');
        }
        else if (pathname === '/initialPrototype.js'){
            serveFile('./initialPrototype.js', 'application/javascript');
        }
        else {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('404 page not found');
		}
    } else if (req.method === 'POST' && pathname === '/submituser'){
        let body = '';

        console.log("Within submituser");

		req.on('data', chunk => {
			body += chunk.toString();
		});

        req.on('end', async () => {
			try {
				const data = JSON.parse(body);
                //console.log("First Name: "+data);
                //console.log("Last Name: "+data);
                await pgClient.query(
                    'INSERT INTO users (firstname, lastname) VALUES ($1, $2)', [data[0], data[1]]
                );
                res.writeHead(200, { 'Content-Type': 'text/plain' });
				res.end('Data successfully submitted');
            } catch (error) {
				console.error(error.stack);
				res.writeHead(500, { 'Content-Type': 'text/plain' });
				res.end('500 Internal Server Error');
			}
        });
    } else if(req.method === 'POST' && pathname === '/submitrecording'){
		let body = '';

		req.on('data', chunk => {
			body += chunk.toString();
		});
		console.log("past recoding de chunk");
		req.on('end', async () => {
			try{
				const data = JSON.parse(body);
				const userResults = await pgClient.query(
					'select user_id from users where firstname= $1 and lastname = $2',
					[data[0], data[1]]
				);
				if(userResults.rows.length === 0){
					throw new Error("No User Found for Recording");
				}
				const user_id = userResults.rows[0].user_id;
				console.log("User ID is: ");
				console.log(user_id);
				await pgClient.query(
					'insert into recordings (user_id, recording) values ($1, $2)', [user_id,data[2]]
					//'insert into recordings (user_id, recording) values ($1, CAST(\'1\' AS bytea))', [user_id]
				);
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.end('data succesfully submitted');
			} catch (error) {
				console.error(error.stack);
				res.writeHead(500, {'Content-Type':'text/plain'});
				res.end('500 Internal Server Error')
			}
		});
	} else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.end('404 page not found');
    }
});

server.listen(port, () => {
	//console.log(`Server running at http://${hostname}:${port}/`);
});