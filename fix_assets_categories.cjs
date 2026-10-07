const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/assets/AssetsClient.js', 'utf8');

// 1. Add STANDARD_CATEGORIES and compute existingCustomCategories inside the component
const compStart = `export default function AssetsClient({ propertyId, rooms = [], assets: initialAssets = [] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  
  const STANDARD_CATEGORIES = [
    "AC 1.5 Ton", "Geyser 15L", "Ceiling Fan", "Study Desk & Chair", 
    "Single Wooden Bed", "Steel Wardrobe"
  ];
  
  const existingCustomCategories = Array.from(new Set(assets.map(a => a.name)))
    .filter(name => !STANDARD_CATEGORIES.includes(name) && name !== "Custom Category");`;
    
content = content.replace(/export default function AssetsClient\(\{ propertyId, rooms = \[\], assets: initialAssets = \[\] \}\) \{[\s\S]*?const \[selectedRoomId, setSelectedRoomId\] = useState\(""\);/, compStart);

// 2. Fix the state defaults
content = content.replace(/const \[newAssetName, setNewAssetName\] = useState\(""\);/, 'const [newAssetName, setNewAssetName] = useState(STANDARD_CATEGORIES[0]);');

// 3. Fix handleAddAsset
const oldHandle = `    const finalName = newAssetName;
    if (!finalName.trim()) {`;
const newHandle = `    const finalName = newAssetName === "Custom Category" ? customAssetName : newAssetName;
    if (!finalName.trim()) {`;
content = content.replace(oldHandle, newHandle);

const oldSuccess = `      if (res.success) {
        alert("Asset added successfully!");
        setSerialNumber("");
        window.location.reload();`;
const newSuccess = `      if (res.success) {
        alert("Asset added successfully!");
        setSerialNumber("");
        setCustomAssetName("");
        window.location.reload();`;
content = content.replace(oldSuccess, newSuccess);

// 4. Replace the datalist back with a strict select + custom input
const oldForm = `<div className={styles.formField}>
                  <label>Asset Name / Category</label>
                  <input
                    list="asset-categories"
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                    placeholder="Select or type a custom name..."
                    required
                  />
                  <datalist id="asset-categories">
                    <option value="AC 1.5 Ton" />
                    <option value="Geyser 15L" />
                    <option value="Ceiling Fan" />
                    <option value="Study Desk & Chair" />
                    <option value="Single Wooden Bed" />
                    <option value="Steel Wardrobe" />
                  </datalist>
                </div>`;

const newForm = `<div className={styles.formField}>
                  <label>Asset Category</label>
                  <select
                    value={newAssetName}
                    onChange={(e) => {
                      setNewAssetName(e.target.value);
                      if (e.target.value !== "Custom Category") setCustomAssetName("");
                    }}
                  >
                    <optgroup label="Standard Categories">
                      {STANDARD_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </optgroup>
                    {existingCustomCategories.length > 0 && (
                      <optgroup label="Your Custom Categories">
                        {existingCustomCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </optgroup>
                    )}
                    <option value="Custom Category" style={{ fontWeight: 600, color: 'var(--primary)' }}>+ Add New Custom Category</option>
                  </select>
                </div>

                {newAssetName === "Custom Category" && (
                  <div className={styles.formField}>
                    <label>Specify New Category Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Microwave, Router"
                      value={customAssetName}
                      onChange={(e) => setCustomAssetName(e.target.value)}
                      required
                    />
                  </div>
                )}`;

content = content.replace(oldForm, newForm);

fs.writeFileSync('src/app/dashboard/assets/AssetsClient.js', content);
