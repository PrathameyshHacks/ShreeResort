const fs = require('fs');
const file = 'C:/Users/HP/Desktop/MP/ShreeResort/frontend/src/pages/AdminReports.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace corrupted strings with correct ones
content = content.replace(/<h1>ðŸ“Š Transactions Report<\/h1>/g, '<h1>📊 Transactions Report</h1>');
content = content.replace(/<p>â‚¹ \{totalRevenue\}<\/p>/g, '<p>₹ {totalRevenue}</p>');
content = content.replace(/`â‚¹ \$\{t\.totalBill\}`/g, '`₹ ${t.totalBill}`');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed encoding in AdminReports.jsx');
