export class LogEntry {
    application: string = "OHUI";
    message: string;
    context?: string;
    level?: LogLevel = LogLevel.Info;
    additionalData?: string;

    constructor(message: string, level: LogLevel = LogLevel.Info, context: string = "", additionalData: string = "") {
        this.message = message;
        this.level = level;
        this.context = context;
        this.additionalData = additionalData;
    }
}

export enum LogLevel {
    Info,
    Debug,
    Error,
    Warning
}