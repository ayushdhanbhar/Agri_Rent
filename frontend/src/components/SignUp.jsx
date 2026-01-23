import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'farmer',
    taluka: '',
    district: '',
    state: '',
    village: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  ];
  // ✅ District → Taluka mapping
const maharashtraTalukas = {
  Pune: [
    "Pune City","Haveli","Mulshi","Mawal","Bhor","Baramati",
    "Indapur","Daund","Purandar","Shirur","Khed","Ambegaon","Junnar"
  ],
  Nashik: [
    "Nashik","Sinnar","Igatpuri","Dindori","Peth","Trimbakeshwar",
    "Kalwan","Baglan","Malegaon","Niphad","Yevla","Chandwad","Deola"
  ],
  Ahmednagar: [
    "Ahmednagar","Akole","Jamkhed","Karjat","Kopargaon","Newasa",
    "Parner","Pathardi","Rahata","Rahuri","Shevgaon","Shrigonda","Shrirampur"
  ],
  Kolhapur: [
    "Karvir","Hatkanangale","Shirol","Radhanagari","Bhudargad",
    "Ajra","Gadhinglaj","Chandgad","Shahuwadi","Panhala"
  ],
  Nagpur: [
    "Nagpur Urban","Nagpur Rural","Hingna","Kalmeshwar",
    "Katol","Narkhed","Parseoni","Ramtek","Savner","Umred"
  ]
};

// ✅ Taluka → Village mapping
const villagesByTaluka = {
  Haveli: ["Wagholi","Manjri","Hadapsar","Mundhwa","Lohegaon","Alandi","Theur"],
  Mulshi: ["Paud","Pirangut","Lavasa","Bavdhan Khurd","Bharatgaon"],
  Baramati: ["Malegaon","Morgaon","Shirsuphal","Katewadi","Hol"],
  Sinnar: ["Wavi","Ghoti","Deshwandi","Pangari"],
  Karjat: ["Mirajgaon","Shrigonda","Kuldharan","Rashin"]
};
 const [availableTalukas, setAvailableTalukas] = useState([]);
const [availableVillages, setAvailableVillages] = useState([]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) 
      newErrors.phone = 'Phone must be 10 digits';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) 
      newErrors.password = 'Password must be at least 6 characters';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.taluka.trim()) newErrors.taluka = 'Taluka is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.village.trim()) newErrors.village = 'Village is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) 
      newErrors.pincode = 'Pincode must be 6 digits';

    // Email validation (optional but if provided, must be valid)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) 
      newErrors.email = 'Invalid email format';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData(prev => ({
    ...prev,
    [name]: value
  }));

  // 🔹 District selected → load talukas
  if (name === "district") {
    setAvailableTalukas(maharashtraTalukas[value] || []);
    setAvailableVillages([]);
    setFormData(prev => ({ ...prev, taluka: "", village: "" }));
  }

  // 🔹 Taluka selected → load villages
  if (name === "taluka") {
    setAvailableVillages(villagesByTaluka[value] || []);
    setFormData(prev => ({ ...prev, village: "" }));
  }

  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    await registerUser();
  };

  const registerUser = async () => {
    console.log('Form Data:', formData);
    setLoading(true);
    setApiError('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.message === 'User registered successfully.') {
        setSubmitted(true);
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setApiError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setApiError('Network error. Please check if the server is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-agri-light via-white to-agri-light py-12 px-4">
      {/* Back Button */}
      <div className="max-w-2xl mx-auto mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-agri-dark hover:text-agri-green transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
      </div>

      {/* Sign Up Container */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-agri-dark to-agri-green text-white p-8">
            <h1 className="text-4xl font-bold mb-2">Join AgriRent</h1>
            <p className="text-agri-light/90">Create your account to start renting and sharing equipment</p>
          </div>

          {/* Success Message */}
          {submitted && (
            <div className="bg-green-50 border-l-4 border-agri-green p-4 m-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-agri-green flex-shrink-0" />
                <div>
                  <p className="font-semibold text-agri-dark">Welcome to AgriRent!</p>
                  <p className="text-gray-600 text-sm">Your account has been created successfully. Redirecting to login...</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {apiError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-700">Registration Failed</p>
                  <p className="text-red-600 text-sm">{apiError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-agri-dark mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                    errors.name ? 'border-red-500 focus:border-red-500' : 'border-agri-light focus:border-agri-green'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-agri-dark mb-2">
                  Email <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                    errors.email ? 'border-red-500 focus:border-red-500' : 'border-agri-light focus:border-agri-green'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-agri-dark mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                    errors.phone ? 'border-red-500 focus:border-red-500' : 'border-agri-light focus:border-agri-green'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-agri-dark mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter a strong password"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                      errors.password ? 'border-red-500 focus:border-red-500' : 'border-agri-light focus:border-agri-green'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-agri-dark mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                    errors.role ? 'border-red-500 focus:border-red-500' : 'border-agri-light focus:border-agri-green'
                  }`}
                >
                  <option value="farmer">Farmer (Renter)</option>
                  <option value="owner">Equipment Owner</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-semibold text-agri-dark mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                    errors.state ? 'border-red-500 focus:border-red-500' : 'border-agri-light focus:border-agri-green'
                  }`}
                >
                  <option value="">Select State</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
              </div>

              {/* District */}
            <select
  name="district"
  value={formData.district}
  onChange={handleChange}
  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
    errors.district ? 'border-red-500' : 'border-agri-light'
  }`}
>
  <option value="">Select District</option>
  {Object.keys(maharashtraTalukas).map(d => (
    <option key={d} value={d}>{d}</option>
  ))}
</select>


              {/* Taluka */}
            <select
  name="taluka"
  value={formData.taluka}
  onChange={handleChange}
  disabled={!formData.district}
  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
    errors.taluka ? 'border-red-500' : 'border-agri-light'
  }`}
>
  <option value="">Select Taluka</option>
  {availableTalukas.map(t => (
    <option key={t} value={t}>{t}</option>
  ))}
</select>

              {/* Village */}
             <select
  name="village"
  value={formData.village}
  onChange={handleChange}
  disabled={!formData.taluka}
  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
    errors.village ? 'border-red-500' : 'border-agri-light'
  }`}
>
  <option value="">Select Village</option>
  {availableVillages.map(v => (
    <option key={v} value={v}>{v}</option>
  ))}
</select>


              {/* Pincode */}
              <div>
                <label className="block text-sm font-semibold text-agri-dark mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="411001"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                    errors.pincode ? 'border-red-500 focus:border-red-500' : 'border-agri-light focus:border-agri-green'
                  }`}
                />
                {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || submitted}
              className={`w-full font-bold py-4 rounded-lg transition transform text-lg ${
                loading || submitted
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-agri-dark to-agri-green text-white hover:shadow-lg hover:scale-105'
              }`}
            >
              {loading ? 'Creating Account...' : submitted ? 'Account Created!' : 'Create Account'}
            </button>

            {/* Login Link */}
            <p className="text-center text-gray-600 mt-6">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-agri-dark font-semibold hover:text-agri-green transition"
              >
                Login here
              </button>
            </p>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border-l-4 border-agri-accent">
          <h3 className="font-bold text-agri-dark mb-3">Why Join AgriRent?</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-2">✓ Access to thousands of agricultural equipment</li>
            <li className="flex gap-2">✓ Earn money by sharing your equipment</li>
            <li className="flex gap-2">✓ Secure and verified user community</li>
            <li className="flex gap-2">✓ 24/7 customer support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
