import { useState, useEffect } from "react";
import { statsApi } from "../../api/statsApi";
import { socket } from "../../api/socket";
import { 
  Users, 
  Banknote, 
  CalendarCheck, 
  Activity 
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
    <div className={`p-3 sm:p-4 rounded-lg ${colorClass}`}>
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
    </div>
    <div className="min-w-0">
      <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</p>
      <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await statsApi.getOverview();
        setOverview(response.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard overview", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  // Socket.io Listener for Real-time Updates
  useEffect(() => {
    socket.connect();
    socket.on("schedule_updated", () => {
      const refreshOverview = async () => {
        try {
          const response = await statsApi.getOverview();
          setOverview(response.data.data);
        } catch (error) {
          console.error("Failed to refresh dashboard overview", error);
        }
      };
      refreshOverview();
    });
    return () => {
      socket.off("schedule_updated");
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="Today's Revenue"
          value={new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(overview.revenue.today)}
          icon={Banknote}
          colorClass="bg-green-100 text-green-600"
        />
        <StatCard
          title="Total Bookings Today"
          value={overview.bookings.total}
          icon={CalendarCheck}
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Confirmed Bookings"
          value={overview.bookings.confirmed}
          icon={Users}
          colorClass="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Available Courts"
          value={overview.courts.available}
          icon={Activity}
          colorClass="bg-orange-100 text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Court Status Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-4 sm:p-6 lg:col-span-1">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Court Status</h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
              <span className="font-semibold text-green-700">Available</span>
              <span className="font-bold text-green-700">{overview.courts.available}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-100 rounded-lg">
              <span className="font-semibold text-yellow-700">Maintenance</span>
              <span className="font-bold text-yellow-700">{overview.courts.maintenance}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg">
              <span className="font-semibold text-red-700">Inactive</span>
              <span className="font-bold text-red-700">{overview.courts.inactive}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-4 sm:p-6 lg:col-span-2">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Recent Bookings</h2>
          {overview.recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No bookings found for today.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Court
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {overview.recentActivity.map((booking) => (
                    <tr key={booking.booking_id}>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-gray-900">
                        <div className="truncate max-w-[120px] sm:max-w-none">{booking.customer_name}</div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                        {booking.court_name}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-500">
                        {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border
                          ${booking.customer_name === 'Maintenance Block' ? 'bg-gray-200 text-gray-800 border-gray-300' :
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800 border-green-200' : 
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                            booking.status === 'completed' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' : 
                            'bg-gray-200 text-gray-800 border-gray-300'}`}>
                          {booking.customer_name === 'Maintenance Block' ? 'maintenance' : booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
