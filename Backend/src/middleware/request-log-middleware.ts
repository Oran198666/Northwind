import { NextFunction, Request, Response } from "express";
import { requestLogService } from "../services/request-log-service";

class RequestLogMiddleware {
public logToDB(request: Request, response: Response, next: NextFunction): void {

    const safeBody = { ...request.body };
    if (safeBody.password) safeBody.password = "***";

    const body = Object.keys(safeBody).length > 0
        ? JSON.stringify(safeBody)
        : null;

    requestLogService
        .logRequest(request.method, request.originalUrl, body)
        .catch(err => console.error("Log failed:", err.message));

    next();
}
}

export const requestLogMiddleware = new RequestLogMiddleware();