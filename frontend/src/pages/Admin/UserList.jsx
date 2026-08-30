import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaTrash, FaPencilAlt, FaCheck, FaTimes, FaSort, FaSortUp, FaSortDown, FaUsers, FaUserShield } from "react-icons/fa";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import { useDeleteUserMutation, useGetUsersQuery, useUpdateUserMutation } from "../../redux/api/usersApiSlice";
import { toast } from "react-toastify";
import AdminMenu from "./AdminMenu";

// ✨ Reusable KPI Card Component (Fixed Theme)
const KpiCard = ({ icon, title, value, colorClass }) => (
  <motion.div 
    className="bg-[var(--card-bg)] border border-[var(--card-border)] p-5 rounded-xl flex items-center gap-4 shadow-lg" 
    whileHover={{ scale: 1.05 }}
  >
    <div className={`p-3 rounded-full ${colorClass}`}>{icon}</div>
    <div>
      <p className="text-[var(--text-muted)] text-sm font-medium">{title}</p>
      <h3 className="text-xl font-bold text-[var(--text-main)]">{value}</h3>
    </div>
  </motion.div>
);

const UserList = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  // State
  const [editModal, setEditModal] = useState({ visible: false, user: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ visible: false, user: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Memoized data
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users
      .filter(user => 
        (user.username.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .filter(user => {
        if (roleFilter === 'admin') return user.isAdmin;
        if (roleFilter === 'customer') return !user.isAdmin;
        return true;
      });
  }, [users, searchTerm, roleFilter]);

  const sortedUsers = useMemo(() => {
    let sortableUsers = [...filteredUsers];
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableUsers;
  }, [filteredUsers, sortConfig]);
  
  // Handlers
  const handleEditOpen = (user) => setEditModal({ visible: true, user: { ...user } });
  
  const handleUpdate = async () => {
    try {
      await updateUser({ userId: editModal.user._id, ...editModal.user }).unwrap();
      toast.success("User updated successfully");
      setEditModal({ visible: false, user: null });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteConfirm.user._id).unwrap();
      toast.success("User deleted successfully");
      setDeleteConfirm({ visible: false, user: null });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="inline ml-1 opacity-30" />;
    return sortConfig.direction === 'asc' ? <FaSortUp className="inline ml-1 text-primary-500" /> : <FaSortDown className="inline ml-1 text-primary-500" />;
  };

  return (
    // 👇 FIX: Theme-aware background and text
    <div className="flex min-h-screen bg-[var(--bg-grad-1)] text-[var(--text-main)]">
      <AdminMenu />
      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            {/* 👇 FIX: Theme-aware headings */}
            <h1 className="text-3xl font-bold mb-2 text-[var(--heading-col)]">User Management</h1>
            <p className="text-[var(--text-muted)] mb-8">View, edit, and manage all registered users.</p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {/* 👇 FIX: High-contrast KPI colors */}
            <KpiCard icon={<FaUsers size={22}/>} title="Total Users" value={users?.length || 0} colorClass="bg-blue-100 !text-blue-600 dark:bg-blue-900/30 dark:!text-blue-400" />
            <KpiCard icon={<FaUserShield size={22}/>} title="Admin Users" value={users?.filter(u => u.isAdmin).length || 0} colorClass="bg-emerald-100 !text-emerald-600 dark:bg-emerald-900/30 dark:!text-emerald-400" />
          </motion.div>

          {/* 👇 FIX: Theme-aware card background */}
          <motion.div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl shadow-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                // 👇 FIX: Theme-aware input
                className="w-full md:w-1/3 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] placeholder-[var(--text-muted)] rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                // 👇 FIX: Theme-aware select
                className="w-full md:w-auto bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins Only</option>
                <option value="customer">Customers Only</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              {/* 👇 FIX: Theme-aware table dividers */}
              <table className="min-w-full divide-y divide-[var(--input-border)]">
                {/* 👇 FIX: Theme-aware table header */}
                <thead className="bg-[var(--bg-grad-2)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('username')}>Name {getSortIcon('username')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>Joined {getSortIcon('createdAt')}</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                {/* 👇 FIX: Theme-aware dividers and hover */}
                <tbody className="divide-y divide-[var(--input-border)]">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}><td colSpan="6" className="p-4"><div className="h-6 bg-[var(--bg-grad-3)] rounded animate-pulse"></div></td></tr>
                    ))
                  ) : error ? (
                     <tr><td colSpan="6" className="text-center py-10 text-red-500">Failed to load users.</td></tr>
                  ) : (
                    sortedUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-[var(--bg-grad-3)] transition-colors">
                        <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{user._id.substring(0, 10)}...</td>
                        <td className="px-6 py-4 text-sm text-[var(--text-main)] font-medium">{user.username}</td>
                        <td className="px-6 py-4 text-sm text-[var(--text-muted)]"><a href={`mailto:${user.email}`} className="hover:text-primary-500">{user.email}</a></td>
                        <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-center">{user.isAdmin ? <FaCheck className="text-green-500 mx-auto" /> : <FaTimes className="text-red-500 mx-auto" />}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEditOpen(user)} className="text-blue-400 hover:text-blue-500 mr-4"><FaPencilAlt /></button>
                          {!user.isAdmin && <button onClick={() => setDeleteConfirm({ visible: true, user })} className="text-red-500 hover:text-red-600"><FaTrash /></button>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Edit User Modal */}
      <Modal isOpen={editModal.visible} onClose={() => setEditModal({ visible: false, user: null })}>
        {editModal.user && (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-6 text-[var(--heading-col)]">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Username</label>
                <input type="text" value={editModal.user.username} onChange={e => setEditModal(prev => ({ ...prev, user: { ...prev.user, username: e.target.value } }))} className="w-full bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Email</label>
                <input type="email" value={editModal.user.email} onChange={e => setEditModal(prev => ({ ...prev, user: { ...prev.user, email: e.target.value } }))} className="w-full bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex items-center justify-between bg-[var(--input-bg)] border border-[var(--input-border)] p-3 rounded-lg">
                <label className="text-sm font-medium text-[var(--text-muted)]">Admin Access</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={editModal.user.isAdmin} onChange={e => setEditModal(prev => ({ ...prev, user: { ...prev.user, isAdmin: e.target.checked } }))} className="sr-only peer" />
                  {/* 👇 FIX: Using gray-300 for light mode toggle bg */}
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setEditModal({ visible: false, user: null })} className="px-6 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold">Cancel</button>
              <button onClick={handleUpdate} className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">Save Changes</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirm.visible} onClose={() => setDeleteConfirm({ visible: false, user: null })}>
        {deleteConfirm.user && (
          <div className="p-2 text-center">
            <h2 className="text-2xl font-bold mb-4 text-[var(--heading-col)]">Confirm Deletion</h2>
            <p className="text-[var(--text-muted)] mb-6">Are you sure you want to delete the user "{deleteConfirm.user.username}"? This action is permanent.</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setDeleteConfirm({ visible: false, user: null })} className="px-6 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold">Cancel</button>
              <button onClick={handleDelete} className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold">Delete User</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserList;