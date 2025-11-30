import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdmin extends Document {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  permissions: string[];
  active: boolean;
  lastLogin?: Date;
  loginAttempts?: number;
  lockUntil?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String },
  role: {
    type: String,
    enum: ["super_admin", "admin", "manager", "support"],
    default: "admin"
  },
  permissions: [{
    type: String,
    enum: [
      "Dashboard",
      "Classes",
      "Driving Lessons",
      "Orders",
      "Instructors",
      "Traffic School",
      "Driving Test/Lessons",
      "Locations",
      "Customers",
      "SEO"
    ]
  }],
  active: { type: Boolean, default: true },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
}, { timestamps: true, collection: 'admin' }); // Especificar nombre exacto de la colección

// Index for better query performance (username and email indexes are already defined as unique in schema)
AdminSchema.index({ role: 1, active: 1 });

const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;