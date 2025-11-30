"use client";

import Loader from "@/components/custom ui/Loader";
import CustomersForm from "@/components/customers/CustomersForm";
import CustomerTabs, { TabType } from "@/components/customers/CustomerTabs";
import ClassHistory from "@/components/customers/ClassHistory";
import CertificateHistory from "@/components/customers/CertificateHistory";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export type CustomerFetchType = {
  id: string;
  firstName: string;
  lastName: string;
  publicMetadata: {
    role: string;
    ssnLast4: string;
    hasLicense: boolean;
    licenseNumber: string;
    birthDate: string;
    middleName: string;
  };
  emailAddresses: CustomerEmailAddressesType[];
};
type CustomerType = {
  _id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email?: string;
  password?: string;
  ssnLast4: string;
  hasLicense: boolean;
  licenseNumber?: string;
  birthDate: string;
  streetAddress: string;
  apartmentNumber: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  sex: string;
  howDidYouHear: string;
  payedAmount: number;
  method: string;
  createdAt?: string; // Añadiendo el campo de fecha de creación
  role?: string;
  publicMetadata?: {
    role?: string;
  };
  emailAddresses?: { emailAddress: string }[];
};
type CustomerEmailAddressesType = {
  emailAddress: string;
};

const CustomerDetails = () => {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("update");
  const params = useParams();

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      const customerId = params?.customerId;
      if (!customerId || typeof customerId !== "string") {
        console.error("Invalid customerId:", customerId);
        setLoading(false);
        return;
      }

      try {

        const res = await fetch(`/api/customers/${customerId}`);
        if (!res.ok) {
          console.error(
            "❌ Failed to fetch customer details. Status:",
            res.status
          );
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const data = await res.json();

        setCustomer(data);
      } catch (err) {
        console.error("[customerId_GET] Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [params]);

  if (loading) return <Loader />;
  if (!customer) return <div>Customer not found</div>;

  const customerId = params?.customerId as string;

  if (customer.publicMetadata?.role === "admin" || (customer as any).role === "admin") {
    return (
      <div className="max-w-5xl p-8 mx-auto bg-white rounded-xl shadow-lg mt-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Details</h1>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-900">
                {customer.firstName}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-900">
                {customer.lastName}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-900">
                {customer.email || customer.emailAddresses?.[0]?.emailAddress}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-900">
                {customer.phoneNumber || "Not available"}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <Button
            onClick={() => window.history.back()}
            className="bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 lg:px-6 py-8">
      <CustomerTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === "update" && <CustomersForm initialData={customer} />}
        {activeTab === "classes" && <ClassHistory customerId={customerId} />}
        {activeTab === "certificates" && (
          <CertificateHistory customerId={customerId} />
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;
