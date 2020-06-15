
import * as express from 'express';
export const routes = express.Router();

const jsonfile = require('jsonfile');
const fileName = '../../config.json';
const fileNameBackup = '../../config.backup.json';

// Config Service
routes.get('/config', (req, res) => {
    res.send(jsonfile.readFileSync(fileName));
});
routes.post('/config', (req, res) => { 
    // make backup
    jsonfile.writeFileSync(fileNameBackup, jsonfile.readFileSync(fileName));
    // save new config
    jsonfile.writeFileSync(fileName, req.body);
    res.send({body: fileName});
});