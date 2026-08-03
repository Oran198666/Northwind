import { dal } from "../utils/dal";

class EmployeeService {

    public async getAllEmployees(): Promise<any[]> {
        const sql = "select * from employees";
        const employees = await dal.execute(sql);
        return employees as any[];
    }

}

export const employeeService = new EmployeeService();