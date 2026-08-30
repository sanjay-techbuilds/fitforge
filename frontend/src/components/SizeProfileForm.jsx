import { useState, useEffect } from "react";
import { useGetSizeProfileQuery, useSaveSizeProfileMutation } from "../redux/api/sizeProfileApiSlice";
import { toast } from "react-toastify";

const SizeProfileForm = () => {
  const { data: profile } = useGetSizeProfileQuery();
  const [saveSizeProfile] = useSaveSizeProfileMutation();

  const [form, setForm] = useState({
    height: "",
    weight: "",
    chest: "",
    waist: "",
    hips: "",
    gender: "",
  });

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveSizeProfile(form).unwrap();
      toast.success("Size profile saved!");
    } catch (err) {
      toast.error(err?.data?.message || err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input type="number" name="height" placeholder="Height (cm)" value={form.height} onChange={handleChange} required />
      <input type="number" name="weight" placeholder="Weight (kg)" value={form.weight} onChange={handleChange} required />
      <input type="number" name="chest" placeholder="Chest (cm)" value={form.chest} onChange={handleChange} required />
      <input type="number" name="waist" placeholder="Waist (cm)" value={form.waist} onChange={handleChange} required />
      <input type="number" name="hips" placeholder="Hips (cm)" value={form.hips} onChange={handleChange} required />
      <select name="gender" value={form.gender} onChange={handleChange} required>
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <button type="submit" className="bg-primary-600 text-white py-2 px-4 rounded-lg mt-2">Save Size Profile</button>
    </form>
  );
};

export default SizeProfileForm;
