import { useState, useEffect } from "react";
import { courtsApi } from "../../api/courtsApi";
import { Plus, Edit2, Trash2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import toast from "react-hot-toast";

const Courts = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const initialForm = {
    name: "",
    status: "available",
    price_per_hour: 100000,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchCourts = async () => {
    try {
      const res = await courtsApi.getAll();
      const courtsData = res.data?.data || res.data || [];
      setCourts(Array.isArray(courtsData) ? courtsData : []);
    } catch (error) {
      console.error("Failed to fetch courts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (court) => {
    setIsEditing(true);
    setFormData({
      court_id: court.court_id,
      name: court.name,
      status: court.status,
      price_per_hour: court.price_per_hour || 100000,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (isEditing) {
        await courtsApi.update(formData.court_id, formData);
        toast.success("Court updated successfully");
      } else {
        await courtsApi.create(formData);
        toast.success("Court created successfully");
      }
      fetchCourts();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this court?")) {
      try {
        await courtsApi.delete(id);
        toast.success("Court deleted");
        fetchCourts();
      } catch (error) {
        toast.error("Failed to delete court");
      }
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
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Court List</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">Manage badminton courts and their status</p>
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition text-sm whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Court</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Court Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price/Hour</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(courts || []).map((court) => (
                <tr key={court.court_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{court.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border
                      ${court.status === 'available' ? 'bg-green-100 text-green-800 border-green-200' : 
                        court.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                        'bg-red-100 text-red-800 border-red-200'}`}>
                      {court.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(court.price_per_hour || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => openEditModal(court)}
                      className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                    >
                      <Edit2 className="h-4 w-4 inline" />
                    </button>
                    <button 
                      onClick={() => handleDelete(court.court_id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {(courts || []).length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No courts found. Click "Add Court" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden divide-y divide-gray-200">
          {(courts || []).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No courts found. Tap "Add" to create one.
            </div>
          ) : (
            (courts || []).map((court) => (
              <div key={court.court_id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{court.name}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border flex-shrink-0
                      ${court.status === 'available' ? 'bg-green-100 text-green-800 border-green-200' : 
                        court.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                        'bg-red-100 text-red-800 border-red-200'}`}>
                      {court.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(court.price_per_hour || 0)}/hour
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button 
                    onClick={() => openEditModal(court)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(court.court_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Court Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={isEditing ? "Edit Court" : "Add New Court"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Court Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full min-w-0 px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
              placeholder="e.g., Court 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per Hour (VND) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price_per_hour"
              required
              min="0"
              step="1000"
              value={formData.price_per_hour}
              onChange={handleChange}
              className="w-full min-w-0 px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
              placeholder="e.g., 150000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full min-w-0 px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
            >
              <option value="available">Available</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-300">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-70 flex items-center justify-center text-sm"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save Court"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Courts;
