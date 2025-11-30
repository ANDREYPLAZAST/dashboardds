"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { navLinks } from "@/lib/constants";

interface CreateAdminModalProps {
    onSuccess: () => void;
}

export function CreateAdminModal({ onSuccess }: CreateAdminModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
    });
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePermissionToggle = (label: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(label)
                ? prev.filter((p) => p !== label)
                : [...prev, label]
        );
    };

    const handleSelectAll = () => {
        if (selectedPermissions.length === navLinks.length) {
            setSelectedPermissions([]);
        } else {
            setSelectedPermissions(navLinks.map(link => link.label));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    role: "admin",
                    permissions: selectedPermissions,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create admin");
            }

            toast.success("Admin created successfully");
            setOpen(false);
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: "",
                password: "",
            });
            setSelectedPermissions([]);
            onSuccess();
        } catch (error: any) {
            console.error("Error creating admin:", error);
            toast.error(error.message || "Error creating admin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-500 text-white hover:bg-blue-600">
                    <Plus className="size-4 mr-2" />
                    Create Admin
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Admin</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new administrator.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6 py-4">
                        {/* Personal Information Section */}
                        <div className="space-y-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                    required
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min. 4 characters"
                                    required
                                    minLength={4}
                                />
                            </div>
                        </div>

                        {/* Permissions Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-semibold">Permissions</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Select which sections this admin can access
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSelectAll}
                                    className="text-xs"
                                >
                                    {selectedPermissions.length === navLinks.length ? "Deselect All" : "Select All"}
                                </Button>
                            </div>
                            <div className="border rounded-lg p-4 bg-muted/30">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                    {navLinks.map((link) => (
                                        <div
                                            key={link.label}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`permission-${link.label}`}
                                                checked={selectedPermissions.includes(link.label)}
                                                onCheckedChange={() => handlePermissionToggle(link.label)}
                                            />
                                            <label
                                                htmlFor={`permission-${link.label}`}
                                                className="text-sm font-medium leading-none cursor-pointer select-none"
                                            >
                                                {link.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {selectedPermissions.length === 0
                                    ? "No permissions selected - admin will have no access"
                                    : `${selectedPermissions.length} permission${selectedPermissions.length > 1 ? 's' : ''} selected`
                                }
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            className="bg-gray-500 text-white hover:bg-gray-600"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 text-white hover:bg-blue-600"
                        >
                            {loading ? "Creating..." : "Create Admin"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
