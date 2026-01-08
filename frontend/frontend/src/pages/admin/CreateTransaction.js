import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionAPI, fuelPriceAPI, rewardAPI } from '../../services/api';
import { HiArrowLeft, HiCheckCircle, HiGift, HiSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';

const CreateTransaction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [fuelPrices, setFuelPrices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerRedemptions, setCustomerRedemptions] = useState([]);
  const [selectedRedemption, setSelectedRedemption] = useState('');
  const [formData, setFormData] = useState({
    customerId: '',
    fuelType: 'petrol',
    liters: '',
    paymentMethod: 'cash',
    pumpOperator: '',
    notes: '',
    isDoublePoints: false,
    redemptionId: ''
  });
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [calculatedPoints, setCalculatedPoints] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  const fetchCustomersAndPrices = async () => {
    try {
      const [customersRes, pricesRes] = await Promise.all([
        transactionAPI.getCustomers(),
        fuelPriceAPI.getFuelPrices()
      ]);

      setCustomers(customersRes.data);
      setFuelPrices(pricesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  const fetchCustomerRedemptions = useCallback(async () => {
    try {
      const response = await rewardAPI.getCustomerApprovedRedemptions(selectedCustomer);
      setCustomerRedemptions(response.data);
    } catch (error) {
      console.error('Error fetching redemptions:', error);
    }
  }, [selectedCustomer]);

  const calculateAmountAndPoints = useCallback(() => {
    const fuelPrice = fuelPrices.find(fp => fp.fuelType === formData.fuelType);
    if (!fuelPrice || !formData.liters) {
      setCalculatedAmount(0);
      setCalculatedPoints(0);
      setFinalAmount(0);
      return;
    }

    const amount = formData.liters * fuelPrice.pricePerLiter;
    setCalculatedAmount(amount);

    const points = Math.floor(amount / 100);
    const finalPoints = formData.isDoublePoints ? points * 2 : points;
    setCalculatedPoints(finalPoints);

    const selectedRedemptionData = customerRedemptions.find(r => r._id === selectedRedemption);
    const cashback = selectedRedemptionData ? selectedRedemptionData.cashbackAmount : 0;
    const final = Math.max(0, amount - cashback);
    setFinalAmount(final);
  }, [fuelPrices, formData.fuelType, formData.liters, formData.isDoublePoints, customerRedemptions, selectedRedemption]);

  useEffect(() => {
    fetchCustomersAndPrices();
  }, []);

  useEffect(() => {
    calculateAmountAndPoints();
  }, [calculateAmountAndPoints]);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerRedemptions();
    }
  }, [selectedCustomer, fetchCustomerRedemptions]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomer(customerId);
    setFormData(prev => ({ ...prev, customerId }));
    setSelectedRedemption('');
    setFormData(prev => ({ ...prev, redemptionId: '' }));

    const customer = customers.find(c => c._id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        pumpOperator: `Recorded by Admin for ${customer.name}`
      }));
    }
  };

  const handleRedemptionSelect = (redemptionId) => {
    setSelectedRedemption(redemptionId);
    setFormData(prev => ({ ...prev, redemptionId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerId) {
      toast.error('Please select a customer');
      return;
    }

    if (!formData.liters || formData.liters <= 0) {
      toast.error('Please enter valid liters');
      return;
    }

    setLoading(true);

    try {
      const response = await transactionAPI.createTransaction({
        ...formData,
        redemptionId: selectedRedemption || undefined
      });

      if (response.data.success) {
        const message = selectedRedemption
          ? `Transaction recorded with ₹${response.data.cashbackApplied} cashback!`
          : 'Transaction recorded successfully!';

        toast.success(message);

        setFormData({
          customerId: '',
          fuelType: 'petrol',
          liters: '',
          paymentMethod: 'cash',
          pumpOperator: '',
          notes: '',
          isDoublePoints: false,
          redemptionId: ''
        });
        setSelectedCustomer('');
        setSelectedRedemption('');
        setCustomerRedemptions([]);
        setCalculatedAmount(0);
        setCalculatedPoints(0);
        setFinalAmount(0);

        setTimeout(() => {
          navigate('/transactions');
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error(error.response?.data?.message || 'Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  const getFuelPrice = (fuelType) => {
    const price = fuelPrices.find(fp => fp.fuelType === fuelType);
    return price ? price.pricePerLiter : 0;
  };

  const selectedCustomerData = customers.find(c => c._id === selectedCustomer);
  const selectedRedemptionData = customerRedemptions.find(r => r._id === selectedRedemption);

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    const term = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(term) ||
      customer.phone.includes(term) ||
      (customer.vehicleNumber && customer.vehicleNumber.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/transactions')}
            className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100"
          >
            <HiArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Record New Transaction</h1>
            <p className="text-gray-600 mt-1">Add fuel purchase for customer</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Customer *
                </label>

                {/* Search Customer Input */}
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, phone or vehicle number..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(customer => (
                      <button
                        key={customer._id}
                        type="button"
                        onClick={() => handleCustomerSelect(customer._id)}
                        className={`p-4 border rounded-lg text-left transition-all relative ${selectedCustomer === customer._id
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                          : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 truncate">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              Vehicle: {customer.vehicleNumber || 'Not set'}
                            </div>
                          </div>
                          {selectedCustomer === customer._id && (
                            <HiCheckCircle className="w-5 h-5 text-green-500 absolute top-4 right-4" />
                          )}
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                            {customer.availablePoints || 0} pts
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-4 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      No customers found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              </div>

              {selectedCustomer && customerRedemptions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <HiGift className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-blue-800">Available Redemptions</h3>
                  </div>
                  <div className="space-y-2">
                    {customerRedemptions.map(redemption => (
                      <button
                        key={redemption._id}
                        type="button"
                        onClick={() => handleRedemptionSelect(redemption._id)}
                        className={`w-full p-3 border rounded-lg text-left transition-all ${selectedRedemption === redemption._id
                          ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                          : 'border-blue-200 hover:border-blue-300'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              ₹{redemption.cashbackAmount} Cashback
                            </div>
                            <div className="text-sm text-gray-500">
                              {redemption.pointsUsed} points • Expires: {new Date(redemption.expiryDate).toLocaleDateString()}
                            </div>
                          </div>
                          {selectedRedemption === redemption._id && (
                            <HiCheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Select a redemption to apply as cashback to this transaction
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['petrol', 'diesel', 'cng'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, fuelType: type })}
                        className={`p-4 border rounded-lg text-center capitalize ${formData.fuelType === type
                          ? type === 'petrol'
                            ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                            : type === 'diesel'
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-green-500 bg-green-50 ring-2 ring-green-200'
                          : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        <div className="font-medium">{type}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          ₹{getFuelPrice(type)}/L
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Liters *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="liters"
                      value={formData.liters}
                      onChange={handleChange}
                      min="0.1"
                      step="0.1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter liters"
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      L
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum: 0.1 liter
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {['cash', 'card', 'upi'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: method })}
                      className={`p-3 border rounded-lg text-center capitalize ${formData.paymentMethod === method
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {method.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isDoublePoints"
                  name="isDoublePoints"
                  checked={formData.isDoublePoints}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="isDoublePoints" className="text-sm text-gray-700">
                  <span className="font-medium">Double Points Promotion</span>
                  <p className="text-gray-500 mt-1">
                    Customer will earn double reward points for this transaction
                  </p>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || !selectedCustomer}
                  className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Recording Transaction...' : 'Record Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Transaction Summary</h2>

            {selectedCustomerData ? (
              <>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-primary-600">
                        {selectedCustomerData.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{selectedCustomerData.name}</div>
                      <div className="text-sm text-gray-500">{selectedCustomerData.phone}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Fuel Type</span>
                    <span className="font-medium capitalize">{formData.fuelType}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Liters</span>
                    <span className="font-medium">{formData.liters || '0'} L</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Price per Liter</span>
                    <span className="font-medium">₹{getFuelPrice(formData.fuelType)}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium capitalize">{formData.paymentMethod}</span>
                  </div>

                  {formData.isDoublePoints && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Promotion</span>
                      <span className="font-medium text-green-600">Double Points</span>
                    </div>
                  )}

                  {selectedRedemptionData && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Cashback Applied</span>
                      <span className="font-medium text-green-600">
                        -₹{selectedRedemptionData.cashbackAmount}
                      </span>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-lg font-bold text-gray-800">Total Amount</span>
                      <span className="text-2xl font-bold text-gray-800">
                        ₹{calculatedAmount.toFixed(2)}
                      </span>
                    </div>

                    {selectedRedemptionData && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-lg font-bold text-gray-800">After Cashback</span>
                        <span className="text-2xl font-bold text-primary-600">
                          ₹{finalAmount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-2">
                      <span className="text-lg font-bold text-gray-800">Points Earned</span>
                      <span className="text-2xl font-bold text-yellow-600">
                        +{calculatedPoints}
                      </span>
                    </div>

                    {formData.isDoublePoints && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 text-center">
                          🎉 Customer will earn double points!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Note:</span> {selectedRedemption
                        ? `Customer will pay ₹${finalAmount.toFixed(2)} after cashback`
                        : `Customer's available points will increase by ${calculatedPoints} points.`
                      }
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">Select a customer to see transaction summary</div>
                <div className="text-sm text-gray-500">
                  Choose a customer from the list to preview transaction details
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTransaction;