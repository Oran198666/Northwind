import express, { Request, Response, Router } from "express";
import { employeeService } from "../services/employee-service";

class EmployeeController {

    public router: Router = express.Router();

    public constructor() {
        this.router.get("/api/employees", this.getAllEmployees);
    }

    private async getAllEmployees(request: Request, response: Response): Promise<void> {
        const employees = await employeeService.getAllEmployees();
        response.json(employees);
    }

}

export const employeeController = new EmployeeController();