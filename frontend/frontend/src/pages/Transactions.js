import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import { HiSearch, HiPlus } from 'react-icons/hi';

const Transactions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTransactions = useCallback(async () => {
    try {
      let response;
      if (user?.role === 'admin') {
        response = await transactionAPI.getTransactions();
      } else {
        response = await transactionAPI.getMyTransactions();
      }
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.fuelType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/create-transaction')}
            className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <HiPlus className="w-5 h-5 mr-2" />
            New Transaction
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt No.
                </th>
                {user?.role === 'admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liters
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.receiptNumber}
                  </td>

                  {user?.role === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.customer?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.customer?.phone}
                      </div>
                    </td>
                  )}

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.type === 'referral' ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        Referral Bonus
                      </span>
                    ) : (
                      <span className={`px-2 py-1 text-xs rounded-full ${transaction.fuelType === 'petrol'
                        ? 'bg-red-100 text-red-800'
                        : transaction.fuelType === 'diesel'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                        }`}>
                        {transaction.fuelType}
                      </span>
                    )}
                    {transaction.description && <div className="text-[10px] text-gray-400 mt-1">{transaction.description}</div>}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.type === 'referral' ? '-' : `${transaction.liters} L`}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      {transaction.type === 'referral' ? '-' : `₹${transaction.totalAmount}`}
                    </div>
                    {transaction.redemptionApplied && (
                      <div className="text-xs text-green-600">
                        -₹{transaction.cashbackAmount} cashback
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      +{transaction.pointsEarned}
                    </span>
                    {transaction.isDoublePoints && (
                      <div className="text-xs text-green-600 mt-1">Double Points!</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No transactions found</div>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/create-transaction')}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Create Your First Transaction
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;