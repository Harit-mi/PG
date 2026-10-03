const fs = require('fs');
const path = 'src/app/pg/[property_id]/tenant-portal/page.js';
let code = fs.readFileSync(path, 'utf8');

// Replace the single day fetch with a full week fetch
const oldFetch = `  // 2. Fetch food menu for today
  const { data: menuData } = await supabase
    .from('food_menus')
    .select('*')
    .eq('property_id', property_id)
    .eq('week_start_date', currentWeekStart)
    .eq('day_of_week', today)
    .single();`;

const newFetch = `  // 2. Fetch food menu for the entire week
  const { data: weeklyMenu } = await supabase
    .from('food_menus')
    .select('*')
    .eq('property_id', property_id)
    .eq('week_start_date', currentWeekStart);

  const menuData = weeklyMenu?.find(m => m.day_of_week === today);`;

code = code.replace(oldFetch, newFetch);

// Replace the props passed to the client
code = code.replace('todayMenu={menuData}', 'todayMenu={menuData}\n      weeklyMenu={weeklyMenu || []}');

fs.writeFileSync(path, code);
