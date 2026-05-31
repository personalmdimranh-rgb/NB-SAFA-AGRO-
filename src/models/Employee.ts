import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAttendanceRecord {
  date: Date;
  status: 'present' | 'absent' | 'leave';
}

export interface IWorkReport {
  date: Date;
  taskPerformed: string;
}

export interface IEmployee extends Document {
  name: string;
  phone: string;
  email?: string;
  employeeId: string;
  division?: string;
  district?: string;
  thana?: string;
  address?: string;
  designation: string;
  salaryStructure: {
    basic: number;
    allowance: number;
    deductions: number;
  };
  weekend: string[];
  allowedAbsent: number;
  absentDeductionRate: number;
  attendanceRecords: IAttendanceRecord[];
  workReports: IWorkReport[];
  paidMonths: string[];
  joiningDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema<IEmployee> = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    employeeId: { type: String, unique: true, required: true },
    division: { type: String, default: '' },
    district: { type: String, default: '' },
    thana: { type: String, default: '' },
    address: String,
    designation: { type: String, required: true },
    salaryStructure: {
      basic: { type: Number, required: true },
      allowance: { type: Number, default: 0 },
      deductions: { type: Number, default: 0 }
    },
    weekend: { type: [String], default: ['friday'] },
    allowedAbsent: { type: Number, default: 1 },
    absentDeductionRate: { type: Number, default: 0 },
    paidMonths: { type: [String], default: [] },
    attendanceRecords: [
      {
        date: { type: Date, required: true },
        status: { type: String, enum: ['present', 'absent', 'leave'], required: true }
      }
    ],
    workReports: [
      {
        date: { type: Date, required: true },
        taskPerformed: { type: String, required: true }
      }
    ],
    joiningDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Employee: Model<IEmployee> = 
  mongoose.models.Employee || 
  mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;
