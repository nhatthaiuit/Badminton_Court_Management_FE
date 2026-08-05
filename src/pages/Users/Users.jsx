import { useState, useEffect } from "react";
import { usersApi } from "../../api/usersApi";
import { UserPlus, Edit2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  
  const initialForm = {
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: user?.role === "staff" ? "customer" : "staff",
    status: "active",
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchUsers = async () => {
    try {
      const res = await usersApi.getAll();
      setUsers(res.data.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const canEditUser = (targetRole) => {
    if (user?.role === "admin") return true;
    if (user?.role === "owner" && (targetRole === "staff" || targetRole === "customer")) return true;
    if (user?.role === "staff" && targetRole === "customer") return true;
    return false;
  };

  const openEditModal = (targetUser) => {
    setEditingUserId(targetUser.user_id);
    setFormData({
      full_name: targetUser.full_name,
      email: targetUser.email,
      phone: targetUser.phone,
      password: "", // Leave empty if not changing
      role: targetUser.role,
      status: targetUser.status || "active",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.email && !formData.email.endsWith("@gmail.com")) {
      toast.error("Email must end with @gmail.com");
      return;
    }
    setSubmitting(true);
    try {
      if (editingUserId) {
        // If password is empty, don't send it to avoid overwriting with empty string
        const submitData = { ...formData };
        if (!submitData.password) delete submitData.password;
        await usersApi.update(editingUserId, submitData);
        toast.success("User updated successfully!");
      } else {
        await usersApi.create(formData);
        toast.success("User created successfully!");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save user");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-300 flex justify-between items-center bg-gray-50 gap-3">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Account List</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">Manage customers, staff, and administrators</p>
          </div>
          <button 
            onClick={() => {
              setEditingUserId(null);
              setFormData(initialForm);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition text-sm whitespace-nowrap"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.user_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                        {u.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{u.full_name}</div>
                        <div className="text-sm text-gray-500">ID: {u.user_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{u.email}</div>
                    <div className="text-sm text-gray-500">{u.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize border
                      ${u.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-200' : 
                        u.role === 'owner' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                        'bg-gray-200 text-gray-800 border-gray-300'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize border ${
                      u.status === 'inactive' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'
                    }`}>
                      {u.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    {canEditUser(u.role) && (
                      <button onClick={() => openEditModal(u)} className="text-gray-400 hover:text-gray-900 transition-colors" title="Edit User">
                        <Edit2 className="h-4 w-4 inline" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden divide-y divide-gray-200">
          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found.</div>
          ) : (
            users.map((u) => (
              <div key={u.user_id} className="p-4 flex items-start justify-between gap-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="h-9 w-9 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                    {u.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{u.full_name}</h3>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize border flex-shrink-0
                        ${u.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-200' : 
                          u.role === 'owner' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                          'bg-gray-200 text-gray-800 border-gray-300'}`}>
                        {u.role}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize border flex-shrink-0 ${
                        u.status === 'inactive' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'
                      }`}>
                        {u.status || 'active'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    <p className="text-xs text-gray-500">{u.phone}</p>
                  </div>
                </div>
                {canEditUser(u.role) && (
                  <button onClick={() => openEditModal(u)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0" title="Edit User">
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUserId ? "Edit User" : "Add New User"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Nguyen Van A" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="email@gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="0901234567" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
              <select name="role" value={formData.role} onChange={handleChange} disabled={user?.role === "staff"} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100 disabled:text-gray-500">
                {user?.role === "admin" && (
                  <>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </>
                )}
                {(user?.role === "admin" || user?.role === "owner") && (
                  <option value="staff">Staff</option>
                )}
                <option value="customer">Customer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password {editingUserId ? "" : <span className="text-red-500">*</span>}</label>
              <input type="password" name="password" required={!editingUserId} value={formData.password} onChange={handleChange} minLength="6" className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder={editingUserId ? "Leave empty to keep" : "Min 6 chars"} />
            </div>
          </div>

          <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-300">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-70">
              {submitting ? "Saving..." : (editingUserId ? "Save Changes" : "Create User")}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Users;
