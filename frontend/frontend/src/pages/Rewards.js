import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { rewardAPI, authAPI } from '../services/api';
import { HiGift, HiCheckCircle, HiXCircle, HiClock, HiCurrencyRupee, HiFire } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Rewards = () => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [redeemType, setRedeemType] = useState('fuel-credit');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch Redemptions
      let redemptionsRes;
      if (user?.role === 'admin') {
        redemptionsRes = await rewardAPI.getRedemptions();
      } else {
        redemptionsRes = await rewardAPI.getMyRedemptions();
        // Fetch latest user profile for up-to-date points
        try {
          const profileRes = await authAPI.getProfile();
          setCurrentUser(prev => ({ ...prev, ...profileRes.data }));
        } catch (e) {
          console.error("Error fetching profile", e);
        }
      }
      setRedemptions(redemptionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      fetchData();
    }
  }, [user, fetchData]);

  const handleRedeem = async () => {
    if (!pointsToRedeem || pointsToRedeem <= 0) {
      toast.error('Please enter valid points');
      return;
    }

    if (pointsToRedeem > currentUser.availablePoints) {
      toast.error('Insufficient points');
      return;
    }

    // Minimum points check removed

    try {
      await rewardAPI.createRedemption({
        pointsUsed: parseInt(pointsToRedeem),
        redemptionType: redeemType
      });

      toast.success('Redemption request submitted! It will be approved by admin.');
      setShowRedeemModal(false);
      setPointsToRedeem('');
      fetchData(); // Refresh both redemptions and user points
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: HiClock },
      approved: { color: 'bg-green-100 text-green-800', icon: HiCheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: HiXCircle },
      applied: { color: 'bg-blue-100 text-blue-800', icon: HiCheckCircle },
      expired: { color: 'bg-gray-100 text-gray-800', icon: HiXCircle }
    };

    const { color, icon: Icon } = config[status] || config.pending;

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        <Icon className="w-4 h-4 mr-1" />
        <span className="capitalize">{status}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Rewards & Redemptions</h1>
          <p className="text-gray-600 mt-2">
            {currentUser?.role === 'admin'
              ? 'Manage customer redemption requests'
              : 'Redeem your points for fuel discounts'}
          </p>
        </div>

        {currentUser?.role === 'customer' && (
          <button
            onClick={() => {
              // Removed minimum points check
              setShowRedeemModal(true);
            }}
            className="flex items-center px-6 py-3 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm"
          >
            <HiGift className="w-5 h-5 mr-2" />
            Redeem Points
          </button>
        )}
      </div>

      {currentUser?.role === 'customer' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Available Points</p>
                <p className="text-3xl font-bold mt-2">{currentUser?.availablePoints || 0}</p>
                <p className="text-sm opacity-90 mt-1">Ready to redeem</p>
              </div>
              <HiCurrencyRupee className="w-12 h-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Earned</p>
                <p className="text-3xl font-bold mt-2">{currentUser?.totalPoints || 0}</p>
                <p className="text-sm opacity-90 mt-1">All time points</p>
              </div>
              <HiGift className="w-12 h-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Redeemed Value</p>
                <p className="text-3xl font-bold mt-2">₹{currentUser?.redeemedPoints || 0}</p>
                <p className="text-sm opacity-90 mt-1">Converted to cashback</p>
              </div>
              <HiFire className="w-12 h-12 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {currentUser?.role === 'customer' && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start">
            <HiGift className="w-8 h-8 text-yellow-600 mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">How Redemption Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600 mb-2">1</div>
                  <div className="font-medium text-gray-800">Request Redemption</div>
                  <div className="text-sm text-gray-600 mt-1">Convert points to cashback (100 points = ₹100)</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600 mb-2">2</div>
                  <div className="font-medium text-gray-800">Admin Approval</div>
                  <div className="text-sm text-gray-600 mt-1">Admin approves your request within 24 hours</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600 mb-2">3</div>
                  <div className="font-medium text-gray-800">Use in Next Fueling</div>
                  <div className="text-sm text-gray-600 mt-1">Cashback applied automatically on your next fuel purchase</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                {currentUser?.role === 'admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cashback Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                {currentUser?.role === 'admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {redemptions.map((redemption) => (
                <tr key={redemption._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {redemption._id.slice(-8).toUpperCase()}
                    </div>
                  </td>

                  {currentUser?.role === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {redemption.customer?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {redemption.customer?.phone}
                      </div>
                    </td>
                  )}

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      {redemption.pointsUsed} pts
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <HiCurrencyRupee className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-lg font-bold text-gray-900">
                        {redemption.cashbackAmount}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {redemption.redemptionType === 'fuel-credit' ? 'Fuel Credit' : 'Cashback'}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(redemption.status)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className={redemption.expiryDate < new Date() ? 'text-red-600' : 'text-gray-600'}>
                        {new Date(redemption.expiryDate).toLocaleDateString()}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(redemption.createdAt).toLocaleDateString()}
                  </td>

                  {currentUser?.role === 'admin' && redemption.status === 'pending' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            if (window.confirm(`Approve ${redemption.pointsUsed} points redemption for ${redemption.customer?.name}?`)) {
                              rewardAPI.updateRedemptionStatus(redemption._id, { status: 'approved' })
                                .then(() => {
                                  toast.success('Redemption approved!');
                                  fetchData();
                                })
                                .catch(error => toast.error('Failed to approve'));
                            }
                          }}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:');
                            if (reason) {
                              rewardAPI.updateRedemptionStatus(redemption._id, {
                                status: 'rejected',
                                notes: reason
                              })
                                .then(() => {
                                  toast.success('Redemption rejected');
                                  fetchData();
                                })
                                .catch(error => toast.error('Failed to reject'));
                            }
                          }}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRedeemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Redeem Points</h2>
                <button
                  onClick={() => setShowRedeemModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HiXCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points to Redeem
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      max={currentUser?.availablePoints || 0}
                      step="1"
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(e.target.value)}
                      className="flex-1 px-3 py-3 border border-gray-300 rounded-lg text-lg font-bold"
                      placeholder="Enter points"
                    />
                    <div className="ml-4">
                      <div className="text-sm text-gray-500">Available</div>
                      <div className="font-bold text-lg">{currentUser?.availablePoints || 0} pts</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Redeem any amount (1 point = ₹1 cashback)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Redemption Type
                  </label>
                  <select
                    value={redeemType}
                    onChange={(e) => setRedeemType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="fuel-credit">Fuel Credit (Cashback on next fueling)</option>
                    <option value="cashback">Direct Cashback</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Fuel credit will be applied automatically during your next fuel purchase
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <HiGift className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        You will receive: ₹{pointsToRedeem || 0} cashback
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        This will be applied as credit on your next fuel purchase
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowRedeemModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRedeem}
                    className="flex-1 bg-primary-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-primary-700"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;