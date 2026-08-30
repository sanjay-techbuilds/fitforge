import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";

const SizeProfile = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [gender, setGender] = useState("Male");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("/api/users/size-profile", {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setHeight(data.height);
        setWeight(data.weight);
        setChest(data.chest);
        setWaist(data.waist);
        setHips(data.hips);
        setGender(data.gender);
      } catch (error) {
        console.log("No existing profile");
      }
    };
    fetchProfile();
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/api/users/size-profile",
        { height, weight, chest, waist, hips, gender },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      toast.success("Size profile saved successfully");
    } catch (error) {
      toast.error("Failed to save profile");
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">My Size Profile</h1>
      <form onSubmit={submitHandler} className="flex flex-col gap-4 w-[30rem]">
        <input type="number" placeholder="Height (cm)" value={height} required onChange={(e) => setHeight(e.target.value)} />
        <input type="number" placeholder="Weight (kg)" value={weight} required onChange={(e) => setWeight(e.target.value)} />
        <input type="number" placeholder="Chest (cm)" value={chest} required onChange={(e) => setChest(e.target.value)} />
        <input type="number" placeholder="Waist (cm)" value={waist} required onChange={(e) => setWaist(e.target.value)} />
        <input type="number" placeholder="Hips (cm)" value={hips} required onChange={(e) => setHips(e.target.value)} />
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <button type="submit" className="bg-primary-500 text-white py-2 rounded">Save Profile</button>
      </form>
    </div>
  );
};

export default SizeProfile;
