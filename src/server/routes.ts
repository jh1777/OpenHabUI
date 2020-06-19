
import * as express from 'express';
import * as fs from 'fs';
import { LogEntry, LogLevel} from '../app/services/model/logEntry.model';

export const routes = express.Router();

const jsonfile = require('jsonfile');
const fileName = '../../config.json';
const fileNameBackup = '../../config.backup.json';
const logDir = '../../_logs';
const logFilePrefix = '-Logs-';


const getDateString = function(): string {
    let date = new Date();
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}

const pad = function(n: number): string {
    if (n < 10) {
      return `0${n}`;
    } else {
      return `${n}`;
    }
  }

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
// Logging
routes.post('/log', (req, res) => {
    let date = new Date();
    
    let input: LogEntry = req.body;

    var additionalData = "";
    if (input.additionalData) {
        additionalData = ` (Data: ${input.additionalData})`;
    }
    var context = "";
    if (input.context) {
        context = `(${input.context}) `;
    }

    let logMessage = `${date.toISOString()} [${LogLevel[input.level ?? LogLevel.Info].toUpperCase()}]: ${context}${input.message}${additionalData}\n`
    let logFileName = `${logDir}/${input.application}${logFilePrefix}${getDateString()}`;
    fs.appendFileSync(logFileName, logMessage );
    res.send({body: logFileName});
});