"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import { navLinks } from "@/lib/constants";
import { Trash2, Eye, EyeOff } from "lucide-react";

interface EditAdminModalProps {
    admin: {
        id: string;
        name: string;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
    } | null;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditAdminModal({ admin, open, onClose, onSuccess }: EditAdminModalProps) {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [editableData, setEditableData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
    });

    useEffect(() => {
        if (admin && open) {
            fetchAdminDetails();
        }
    }, [admin, open]);

    const fetchAdminDetails = async () => {
        if (!admin) return;

        try {
            const res = await fetch(`/api/admins/${admin.id}`);
            if (!res.ok) throw new Error("Failed to fetch admin details");

            const data = await res.json();
            setSelectedPermissions(data.permissions || []);
            setEditableData({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                email: data.email || "",
                phoneNumber: data.phoneNumber || "",
            });
        } catch (error) {
            console.error("Error fetching admin details:", error);
            toast.error("Error loading admin details");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditableData({ ...editableData, [e.target.name]: e.target.value });
    };

    const handleUpdateBasicInfo = async () => {
        if (!admin) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/admins/${admin.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName: editableData.firstName,
                    lastName: editableData.lastName,
                    email: editableData.email,
                    phoneNumber: editableData.phoneNumber,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update admin info");
            }

            toast.success("Admin info updated successfully");
            onSuccess();
        } catch (error: any) {
            console.error("Error updating admin info:", error);
            toast.error(error.message || "Error updating admin info");
        } finally {
            setLoading(false);
        }
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

    const handleUpdatePermissions = async () => {
        if (!admin) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/admins/${admin.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    permissions: selectedPermissions,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update permissions");
            }

            toast.success("Permissions updated successfully");
        } catch (error: any) {
            console.error("Error updating permissions:", error);
            toast.error(error.message || "Error updating permissions");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!admin || !newPassword) {
            toast.error("Please enter a new password");
            return;
        }

        if (newPassword.length < 4) {
            toast.error("Password must be at least 4 characters");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`/api/admins/${admin.id}/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    newPassword,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update password");
            }

            toast.success("Password updated successfully");
            setNewPassword("");
        } catch (error: any) {
            console.error("Error updating password:", error);
            toast.error(error.message || "Error updating password");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!admin) return;

        setDeleting(true);

        try {
            const res = await fetch(`/api/admins/${admin.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to delete admin");
            }

            toast.success("Admin deleted successfully");
            onClose();
            onSuccess();
        } catch (error: any) {
            console.error("Error deleting admin:", error);
            toast.error(error.message || "Error deleting admin");
        } finally {
            setDeleting(false);
        }
    };

    const handleClose = () => {
        setNewPassword("");
        setShowNewPassword(false);
        onClose();
    };

    if (!admin) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Admin</DialogTitle>
                    <DialogDescription>
                        Update admin permissions and password
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Admin Info - Editable */}
                    <div className="space-y-4 pb-4 border-b">
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-base font-semibold">Basic Information</Label>
                            <Button
                                type="button"
                                onClick={handleUpdateBasicInfo}
                                disabled={loading}
                                size="sm"
                                className="bg-blue-500 text-white hover:bg-blue-600"
                            >
                                Save Info
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input
                                    name="firstName"
                                    value={editableData.firstName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input
                                    name="lastName"
                                    value={editableData.lastName}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                name="email"
                                type="email"
                                value={editableData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input
                                name="phoneNumber"
                                value={editableData.phoneNumber}
                                onChange={handleInputChange}
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
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                                {selectedPermissions.length === 0
                                    ? "No permissions selected - admin will have no access"
                                    : `${selectedPermissions.length} permission${selectedPermissions.length > 1 ? 's' : ''} selected`
                                }
                            </p>
                            <Button
                                type="button"
                                onClick={handleUpdatePermissions}
                                disabled={loading}
                                size="sm"
                                className="bg-blue-500 text-white hover:bg-blue-600"
                            >
                                Update Permissions
                            </Button>
                        </div>
                    </div>

                    {/* Change Password Section */}
                    <div className="space-y-3 pt-4 border-t">
                        <div>
                            <Label className="text-base font-semibold">Reset Password</Label>
                            <p className="text-sm text-muted-foreground mt-1">
                                Set a new password for this admin
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="New password (min. 4 characters)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength={4}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <Button
                                type="button"
                                onClick={handleUpdatePassword}
                                disabled={loading || !newPassword}
                                className="bg-blue-500 text-white hover:bg-blue-600"
                            >
                                Update Password
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-3 flex-col sm:flex-row sm:justify-between border-t pt-4">
                    <Button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting || loading}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                    >
                        <Trash2 className="size-4 mr-2" />
                        {deleting ? "Deleting..." : "Delete Admin"}
                    </Button>
                    <Button
                        type="button"
                        className="bg-gray-500 text-white hover:bg-gray-600"
                        onClick={handleClose}
                        disabled={loading || deleting}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
