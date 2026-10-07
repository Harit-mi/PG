const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/assets/AssetsClient.js', 'utf8');

// Replace the select and conditional input with a single input + datalist
const oldForm = `<div className={styles.formField}>
                  <label>Asset Category</label>
                  <select
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                  >
                    <option value="AC 1.5 Ton">AC 1.5 Ton</option>
                    <option value="Geyser 15L">Geyser 15L</option>
                    <option value="Ceiling Fan">Ceiling Fan</option>
                    <option value="Study Desk & Chair">Study Desk & Chair</option>
                    <option value="Single Wooden Bed">Single Wooden Bed</option>
                    <option value="Steel Wardrobe">Steel Wardrobe</option>
                    <option value="Custom Category">Custom Category</option>
                  </select>
                </div>

                {newAssetName === "Custom Category" && (
                  <div className={styles.formField}>
                    <label>Specify Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Microwave"
                      value={customAssetName}
                      onChange={(e) => setCustomAssetName(e.target.value)}
                      required
                    />
                  </div>
                )}`;

const newForm = `<div className={styles.formField}>
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

content = content.replace(oldForm, newForm);

// Also need to remove the customAssetName logic from handleAddAsset
content = content.replace(/const finalName = newAssetName === "Custom Category" \? customAssetName : newAssetName;/, 'const finalName = newAssetName;');
content = content.replace(/setCustomAssetName\(""\);/, '');

fs.writeFileSync('src/app/dashboard/assets/AssetsClient.js', content);
