const fs = require('fs');
let content = fs.readFileSync('src/components/AddRoomModal.js', 'utf8');

// Replace the Room Type select block and Rent/Capacity blocks with the new requested order
const newFormFields = `
              <div className={styles.formGroup}>
                <label>Room Number</label>
                <input name="room_number" required placeholder="e.g. 105" className={styles.input} />
              </div>
              
              <div className={styles.formGroup}>
                <label>Number of Beds</label>
                <input name="type" type="text" required placeholder="e.g. 2" className={styles.input} />
              </div>

              <div className={styles.formGroup}>
                <label>Capacity (Persons)</label>
                <input name="capacity" type="number" required placeholder="2" min="1" className={styles.input} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </div>

              <div className={styles.formGroup}>
                <label>Rent Per Person / Head (₹)</label>
                <input name="rent_per_bed" type="number" required placeholder="8000" className={styles.input} value={rent} onChange={(e) => setRent(e.target.value)} />
              </div>
`;

// we need to replace the content inside <form ...> ... <div className={styles.actions}>
content = content.replace(/<div className=\{styles\.formGroup\}>\s*<label>Room Number<\/label>[\s\S]*?(?=<div className=\{styles\.actions\}>)/, newFormFields);

fs.writeFileSync('src/components/AddRoomModal.js', content);
