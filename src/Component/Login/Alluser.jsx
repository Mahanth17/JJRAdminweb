import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, Search, RefreshCw, UserCheck, UserX } from 'lucide-react';
import { rootApi } from '../../../axiosInstance';

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchAllUsers();
  }, []);

const fetchAllUsers = async () => {
  try {
    setLoading(true);
    const response = await rootApi.get('/api/user/getAllUsers');
    // Sort users by id (ascending)
    const sortedUsers = (response.data || []).slice().sort((a, b) => a.id - b.id);
    setUsers(sortedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    alert('Failed to load users. Please try again.');
  } finally {
    setLoading(false);
  }
};

  // Filter users based on search query and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber?.includes(searchQuery) ||
      user.emailId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'ALL' || 
      user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Count users by status
  const activeCount = users.filter(u => u.status === 'ACTIVE').length;
  const inactiveCount = users.filter(u => u.status !== 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-emerald-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Users className="text-purple-600" size={36} />
                All Users
              </h1>
              <p className="text-gray-600">Manage and view all registered users</p>
            </div>
            <button
              onClick={fetchAllUsers}
              disabled={loading}
              className="flex items-center gap-2 bg-green-400 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="text-purple-500" size={40} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Active Users</p>
                <p className="text-3xl font-bold text-green-700">{activeCount}</p>
              </div>
              <UserCheck className="text-green-500" size={40} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Inactive Users</p>
                <p className="text-3xl font-bold text-red-700">{inactiveCount}</p>
              </div>
              <UserX className="text-red-500" size={40} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition font-medium"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Users Grid */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-md">
                <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchQuery || statusFilter !== 'ALL' ? 'No Users Found' : 'No Users Available'}
                </h3>
                <p className="text-gray-400">
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'Try adjusting your search or filter'
                    : 'No users have been registered yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
                  >
                    {/* Card Header with Avatar */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-300 p-6 relative">
                      <div className="flex flex-col items-center text-black">
                        <h3 className="text-lg font-bold text-center line-clamp-1">
                          {user.displayName || 'N/A'}
                        </h3>
                        <p className="text-xs text-black/80 mt-1">ID: #{user.id}</p>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-col flex-grow p-5 bg-white">
                      <div className="space-y-3 mb-4">
                        {/* First Name & Last Name */}
                        {(user.firstName || user.lastName || user.displayName) && (() => {
                            // Fallback: split displayName if firstName/lastName are missing
                            let firstName = user.firstName;
                            let lastName = user.lastName;
                            if ((!firstName || !lastName) && user.displayName) {
                              const [first, ...rest] = user.displayName.split(' ');
                              firstName = firstName || first;
                              lastName = lastName || (rest.length > 0 ? rest.join(' ') : '');
                            }
                            return (
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {firstName && (
                                    <div>
                                      <span className="text-xs uppercase text-gray-800 font-bold tracking-wider block">First Name</span>
                                      <span className="font-semibold text-gray-700">{firstName}</span>
                                    </div>
                                  )}
                                  {lastName && (
                                    <div className={firstName ? 'border-l border-gray-200 pl-2' : ''}>
                                      <span className="text-xs uppercase text-gray-400 font-bold tracking-wider block">Last Name</span>
                                      <span className="font-semibold text-gray-700">{lastName}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                        {/* Phone Number */}
                        {user.phoneNumber && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="p-2 bg-purple-50 rounded-lg">
                              <Phone size={16} className="text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <span className="text-xs uppercase text-gray-400 font-bold tracking-wider block">Phone</span>
                              <span className="font-semibold text-gray-700">{user.phoneNumber}</span>
                            </div>
                          </div>
                        )}

                        {/* Email */}
                        {user.emailId && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="p-2 bg-pink-50 rounded-lg">
                              <Mail size={16} className="text-pink-600" />
                            </div>
                            <div className="flex-1">
                              <span className="text-xs uppercase text-gray-400 font-bold tracking-wider block">Email</span>
                              <span className="font-semibold text-gray-700 truncate block">{user.emailId}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status Badge at Bottom */}
                      <div className="mt-auto pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-semibold">Account Status</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            user.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {user.status === 'ACTIVE' ? (
                              <span className="flex items-center gap-1">
                                <UserCheck size={12} /> Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <UserX size={12} /> Inactive
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results Count */}
            {filteredUsers.length > 0 && (
              <div className="mt-6 text-center text-sm text-gray-600">
                Showing <span className="font-bold text-purple-600">{filteredUsers.length}</span> of{' '}
                <span className="font-bold text-purple-600">{users.length}</span> users
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}