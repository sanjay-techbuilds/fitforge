import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetSizeProfileQuery,
  useSaveSizeProfileMutation,
} from "../redux/api/sizeProfileApiSlice";
import { FaRuler, FaShoePrints } from 'react-icons/fa';

const SizeProfilePage = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSizeProfileQuery(undefined, { skip: !userInfo });

  const [saveProfile, { isLoading: isSaving }] = useSaveSizeProfileMutation();

  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    chest: "",
    waist: "",
    hips: "",
    gender: "",
    shoeSize: "",
    preferredFit: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        height: profile.height || "",
        weight: profile.weight || "",
        chest: profile.chest || "",
        waist: profile.waist || "",
        hips: profile.hips || "",
        gender: profile.gender || "",
        shoeSize: profile.shoeSize || "",
        preferredFit: profile.preferredFit || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShoeSizeSelect = (size) => {
    setFormData({ ...formData, shoeSize: size });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveProfile(formData).unwrap();
      toast.success("Profile saved successfully!");
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to save profile");
    }
  };

  // --- MODIFIED InputField ---
  const InputField = ({ label, name, placeholder, value }) => (
    <div>
      {/* 👇 FIX: Label Text Variable */}
      <label htmlFor={name} className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
        {label}
      </label>
      <input
        type="number"
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required
        // 👇 FIX: Input Background, Border & Text Variables
        className="p-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg w-full text-[var(--text-main)] focus:ring-2 focus:ring-primary-500 transition placeholder-[var(--text-muted)]"
      />
    </div>
  );

  const ShoeSizeSelector = () => {
    const shoeSizes = [6, 7, 8, 9, 10, 11, 12];
    return (
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
        {shoeSizes.map(size => (
          <button
            key={size}
            type="button"
            onClick={() => handleShoeSizeSelect(size)}
            // 👇 FIX: Button Backgrounds & Text Variables
            className={`py-3 px-4 rounded-lg font-bold text-center transition-all duration-200 border-2 ${
              formData.shoeSize === size
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-muted)] hover:border-primary-500 hover:text-[var(--text-main)]'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) return <div className="text-[var(--text-main)] text-center mt-10">Loading...</div>;
  if (isError) return <div className="text-red-500 text-center mt-10">{error?.data?.message || "Error fetching profile"}</div>;

  return (
    <div className="container mx-auto max-w-2xl mt-10 p-4">
      {/* 👇 FIX: Card Background & Border Variables */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 shadow-2xl">
        {/* 👇 FIX: Heading Text Variable */}
        <h2 className="text-4xl font-extrabold mb-2 text-center text-[var(--text-main)]">Your Size Profile</h2>
        {/* 👇 FIX: Subtext Variable */}
        <p className="text-[var(--text-muted)] text-center mb-8">Accurate measurements lead to perfect fits and better recommendations.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-primary-500 mb-4 flex items-center gap-2"><FaRuler /> Body Measurements</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField label="Height (cm)" name="height" placeholder="e.g., 175" value={formData.height} />
              <InputField label="Weight (kg)" name="weight" placeholder="e.g., 70" value={formData.weight} />
              <InputField label="Chest (cm)" name="chest" placeholder="e.g., 102" value={formData.chest} />
              <InputField label="Waist (cm)" name="waist" placeholder="e.g., 86" value={formData.waist} />
              <InputField label="Hips (cm)" name="hips" placeholder="e.g., 100" value={formData.hips} />

              <div>
                {/* 👇 FIX: Label Text Variable */}
                <label htmlFor="gender" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  // 👇 FIX: Select Background & Text Variables
                  className="p-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg w-full text-[var(--text-main)] focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="sm:col-span-2"> 
                {/* 👇 FIX: Label Text Variable */}
                <label htmlFor="preferredFit" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
                  Preferred Fit
                </label>
                <select
                  id="preferredFit"
                  name="preferredFit"
                  value={formData.preferredFit}
                  onChange={handleChange}
                  required
                  // 👇 FIX: Select Background & Text Variables
                  className="p-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg w-full text-[var(--text-main)] focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">How do you like your clothes to fit?</option>
                  <option value="Slim">Slim Fit</option>
                  <option value="Regular">Regular Fit</option>
                  <option value="Loose">Loose Fit</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-primary-500 mb-4 flex items-center gap-2"><FaShoePrints /> Shoe Size (Optional)</h3>
            <ShoeSizeSelector />
            {/* 👇 FIX: Subtext Variable */}
            <p className="text-xs text-[var(--text-muted)] mt-2">Select your most common shoe size (UK/India).</p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-primary-700 disabled:opacity-50 transition-transform hover:scale-105"
          >
            {isSaving ? "Saving..." : "Save / Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SizeProfilePage;