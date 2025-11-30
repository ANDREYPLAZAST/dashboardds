"use client";
import { SimpleDataTable } from "@/components/custom ui/SimpleDataTable";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import { Plus, ArrowUpRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/custom ui/Loader";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Link from "next/link";
import Delete from "@/components/custom ui/Delete";
import { format } from "date-fns";
import { CreateAdminModal } from "@/components/customers/CreateAdminModal";
import { EditAdminModal } from "@/components/customers/EditAdminModal";

interface Customer {
  id: string;
  name: string;
  email: string;
  licenseNumber?: string;
  createdAt?: string;
  role: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
}

const CustomersDashboard = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"user" | "admin">("user");
  const [selectedAdmin, setSelectedAdmin] = useState<Customer | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const router = useRouter();

  const getCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/customers", { method: "GET" });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const text = await res.text();
      if (!text) {
        console.warn("[customers_GET] Empty response");
        setCustomers([]);
        return;
      }

      const data = JSON.parse(text);
      setCustomers(data);
    } catch (err) {
      console.error("[customers_GET]", err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([getCustomers()]);
    };
    fetchData();
  }, []);

  const filteredCustomers = customers.filter((c) => c.role === filter);

  if (loading) return <Loader />;

  const handleAdminClick = (admin: Customer) => {
    setSelectedAdmin(admin);
    setEditModalOpen(true);
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (customer: Customer) => (
        filter === "admin" ? (
          <button
            onClick={() => handleAdminClick(customer)}
            className="flex items-center gap-2 font-semibold text-blue-500 hover:text-blue-700"
          >
            {customer.name}
            <ArrowUpRight size={16} className="opacity-75" />
          </button>
        ) : (
          <Link
            href={`/customers/${customer.id}`}
            className="flex items-center gap-2 font-semibold text-blue-500 hover:text-blue-700"
          >
            {customer.name}
            <ArrowUpRight size={16} className="opacity-75" />
          </Link>
        )
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (customer: Customer) => (
        <span className="font-medium text-gray-700">{customer.email}</span>
      ),
    },
    ...(filter === "user"
      ? [
        {
          key: "licenseNumber",
          header: "License Number",
          render: (customer: Customer) => (
            <span className="font-medium text-gray-700">
              {customer.licenseNumber || "Not available"}
            </span>
          ),
        },
      ]
      : [
        {
          key: "phoneNumber",
          header: "Phone",
          render: (customer: Customer) => (
            <span className="font-medium text-gray-700">
              {customer.phoneNumber || "Not available"}
            </span>
          ),
        },
      ]),
    {
      key: "createdAt",
      header: "Registration Date",
      render: (customer: Customer) => {
        const date = customer.createdAt ? new Date(customer.createdAt) : null;
        return (
          <span className="font-medium text-gray-700">
            {date ? format(date, "MMM d, yyyy h:mm a") : "Not available"}
          </span>
        );
      },
    },
    ...(filter === "user"
      ? [
        {
          key: "actions",
          header: "Actions",
          render: (customer: Customer) => (
            <Delete item="customers" id={customer.id} />
          ),
        },
      ]
      : []),
  ];

  return (
    <div className="p-5">
      <DashboardHeader title="Customers">
        <div className="flex gap-2">
          <CreateAdminModal onSuccess={getCustomers} />
          <Button
            className="bg-blue-500 text-white"
            onClick={() => router.push("/customers/new")}
          >
            <Plus className="size-4 mr-2" />
            Create customer
          </Button>
        </div>
      </DashboardHeader>
      <div className="mt-6">
        <div className="flex gap-4 mb-4">
          <Button
            className={filter === "user" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
            onClick={() => setFilter("user")}
          >
            Users
          </Button>
          <Button
            className={filter === "admin" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
            onClick={() => setFilter("admin")}
          >
            Admins
          </Button>
        </div>
        <Separator className="bg-gray-400 my-4" />
        <SimpleDataTable
          data={filteredCustomers}
          columns={columns}
          searchKeys={["name", "email", "licenseNumber", "phoneNumber"]}
        />
      </div>

      <EditAdminModal
        admin={selectedAdmin}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedAdmin(null);
        }}
        onSuccess={getCustomers}
      />
    </div>
  );
};

export default CustomersDashboard;
