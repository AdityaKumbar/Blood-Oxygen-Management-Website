import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { authService } from "../services/authService";
import { updateUser } from "../redux/authSlice";

const BELAGAVI_PRESETS = [
  { name: "Channamma Circle (Central)", lat: 15.8569, lng: 74.5117 },
  { name: "Tilakwadi", lat: 15.8428, lng: 74.5032 },
  { name: "Camp", lat: 15.8624, lng: 74.5038 },
  { name: "Shahapur", lat: 15.8369, lng: 74.5123 },
  { name: "Hindwadi", lat: 15.8354, lng: 74.4998 },
  { name: "Angol", lat: 15.8239, lng: 74.5085 },
  { name: "Udyambag (Industrial)", lat: 15.8198, lng: 74.4842 },
];

const DEFAULT_LAT = 15.8497;
const DEFAULT_LNG = 74.4977;

export default function HospitalProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [latitude, setLatitude] = useState(user?.latitude || DEFAULT_LAT);
  const [longitude, setLongitude] = useState(user?.longitude || DEFAULT_LNG);
  const [saving, setSaving] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const leafletLoadedRef = useRef(false);

  // Sync inputs with Redux user profile details (async load or after save)
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setLatitude(user.latitude || DEFAULT_LAT);
      setLongitude(user.longitude || DEFAULT_LNG);
    }
  }, [user]);

  // Dynamically load Leaflet assets
  useEffect(() => {
    if (leafletLoadedRef.current) return;

    const loadLeaflet = async () => {
      try {
        if (!document.getElementById("leaflet-css")) {
          const cssLink = document.createElement("link");
          cssLink.id = "leaflet-css";
          cssLink.rel = "stylesheet";
          cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(cssLink);
        }

        if (!window.L) {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => {
            leafletLoadedRef.current = true;
            setMapLoaded(true);
          };
          document.body.appendChild(script);
        } else {
          leafletLoadedRef.current = true;
          setMapLoaded(true);
        }
      } catch (err) {
        toast.error("Failed to load map scripts. Please refresh.");
      }
    };

    loadLeaflet();
  }, []);

  // Initialize and update Map
  useEffect(() => {
    if (!mapLoaded || !window.L) return;

    const L = window.L;

    // Fixed marker icon issue in production Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const initialLat = Number(latitude) || DEFAULT_LAT;
    const initialLng = Number(longitude) || DEFAULT_LNG;

    if (!mapRef.current) {
      // Create map
      const map = L.map("hospital-map").setView([initialLat, initialLng], 14);
      mapRef.current = map;

      // Add Google Maps tile layer
      L.tileLayer("https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        subdomains: ["0", "1", "2", "3"],
        attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
      }).addTo(map);

      // Create draggable marker
      const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      // Listen to marker drag events
      marker.on("dragend", () => {
        const position = marker.getLatLng();
        setLatitude(Number(position.lat.toFixed(6)));
        setLongitude(Number(position.lng.toFixed(6)));
      });

      // Listen to map click events to place marker
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setLatitude(Number(lat.toFixed(6)));
        setLongitude(Number(lng.toFixed(6)));
      });
    } else {
      // If map is already initialized, just update marker and view
      const marker = markerRef.current;
      const map = mapRef.current;
      if (marker && map) {
        marker.setLatLng([initialLat, initialLng]);
        map.panTo([initialLat, initialLng]);
      }
    }
  }, [mapLoaded, latitude, longitude]);

  // Clean up map instance on component unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (err) {
          // Silent catch if already removed
        }
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Handle Preset selection
  const selectPreset = (preset) => {
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setAddress((prev) => prev || preset.name);

    if (window.L && markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([preset.lat, preset.lng]);
      mapRef.current.setView([preset.lat, preset.lng], 15);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    try {
      setSaving(true);
      const updated = await authService.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
      });

      // Update Redux state
      dispatch(updateUser(updated));
      toast.success("Profile and location updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  };

  const isProfileComplete = !!(user?.phone && user?.address && user?.latitude && user?.latitude !== DEFAULT_LAT);

  return (
    <div className="space-y-6">
      {/* Header and Introduction */}
      <section className="rounded-3xl border border-white/70 bg-gradient-to-r from-rose-50/50 to-blue-50/50 p-6 shadow-sm backdrop-blur-md">
        <h2 className="text-2xl font-bold text-slate-900">Hospital Profile & Location Hub</h2>
        <p className="mt-1 text-sm text-slate-600">
          Configure your emergency service station info, telephone number, and lock in your coordinates on the map.
          This location is instantly mirrored inside our mobile user app to route blood and oxygen requests to you.
        </p>
      </section>

      {/* Completeness Alert Banners */}
      {!isProfileComplete ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm backdrop-blur-sm flex items-start gap-4 animate-fade-in">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="text-sm font-bold text-amber-900">Profile Details Missing (Action Required)</h4>
            <p className="mt-1 text-xs text-amber-700 leading-relaxed">
              Your station profile is currently not active on the network. To fix this, please enter your emergency telephone contact, street address, and drag the marker to your hospital's coordinate location on the Google Map below. Click <strong>Save Profile Details</strong> to publish it live!
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/30 p-5 shadow-sm backdrop-blur-sm flex items-start gap-4">
          <span className="text-2xl">✅</span>
          <div>
            <h4 className="text-sm font-bold text-emerald-950">Profile Fully Configured & Discoverable</h4>
            <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
              Excellent! Your emergency service coordinates are successfully saved and discoverable on the central emergency maps. You may alter or update these values at any time using the inputs below.
            </p>
          </div>
        </div>
      )}

      {/* Main Profile Form Card */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Side: General Info Inputs */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-100 lg:col-span-2 space-y-5">
          <h3 className="text-lg font-bold text-slate-900 border-b pb-3 border-slate-100">General Information</h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Hospital Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none transition"
                placeholder="e.g. Belgaum Civil Hospital"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Emergency Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none transition"
                placeholder="e.g. +91 83124 01234"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Physical Address / Locality</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none transition"
                placeholder="e.g. Dr. B. R. Ambedkar Road, Civil Hospital Compound"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Latitude</label>
                <input
                  type="text"
                  readOnly
                  value={latitude}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Longitude</label>
                <input
                  type="text"
                  readOnly
                  value={longitude}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-3 px-4 shadow-lg shadow-rose-200 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 text-sm"
              >
                {saving ? "Saving Changes..." : "Save Profile Details"}
              </button>
            </div>
          </form>
        </section>

        {/* Right Side: Map & Localities of Belagavi Karnataka */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-100 lg:col-span-3 space-y-4 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Map Location (Belagavi, KA)</h3>
              <p className="text-xs text-slate-500">Drag marker or click map directly to set exact geolocation.</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Belagavi Locality Lock</span>
          </div>

          {/* Preset Buttons for Quick Belagavi Navigation */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Quick Belagavi Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {BELAGAVI_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => selectPreset(preset)}
                  className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 px-2.5 py-1 text-xs font-medium text-slate-600 transition"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Leaflet Map Div */}
          <div className="relative flex-1 min-h-[360px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
            <div id="hospital-map" className="absolute inset-0 z-10 w-full h-full" style={{ minHeight: "360px" }}></div>
            {!mapLoaded && (
              <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-20">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-600 border-t-transparent mx-auto"></div>
                  <p className="text-xs text-slate-500">Initializing Belagavi Locality Map...</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
