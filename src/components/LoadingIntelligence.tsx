import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function LoadingIntelligence() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  const destination = searchParams.get("destination") || searchParams.get("name") || "Your destination";
  const country = searchParams.get("country") || "";

  useEffect(() => {
    console.log("[transition] mounted");
    setVisible(true);

    const timer = setTimeout(() => {
      console.log("[transition] navigating to results");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("loading");
      navigate(`/search?${params.toString()}`, { replace: true });
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center">
      <div className={`text-center transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
        <h1 className="text-4xl font-medium text-gray-900 mb-2">
          {destination}{country ? `, ${country}` : ""}
        </h1>
        <p className="text-lg text-gray-500">
          Preparing your intelligence brief
        </p>
      </div>
    </div>
  );
}
