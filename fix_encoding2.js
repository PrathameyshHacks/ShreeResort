const fs = require('fs');
const file = 'C:/Users/HP/Desktop/MP/ShreeResort/frontend/src/pages/booking.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace using more resilient regexes
content = content.replace(/alert\(err\.response\?\.data\?\.message \|\| ".*? Booking failed"\);/g, 'alert(err.response?.data?.message || "❌ Booking failed");');
content = content.replace(/<h1>.*? Book Your Stay<\/h1>/g, '<h1>🛏️ Book Your Stay</h1>');
content = content.replace(/<p className="price">.*? {room\.price} \/ night<\/p>/g, '<p className="price">₹ {room.price} / night</p>');
content = content.replace(/\{\/\* .*? ROOM RATING \*\/\}/g, '{/* ⭐ ROOM RATING */}');
content = content.replace(/[^\n]*? \{reviewMap\[room\.title\]\.avgRating\} \/ 5/g, '\t\t\t\t\t\t\t\t\t\t\t⭐ {reviewMap[room.title].avgRating} / 5');
content = content.replace(/\{\/\* .*? AVAILABILITY STATUS \*\/\}/g, '{/* 🔥 AVAILABILITY STATUS */}');

content = content.replace(/\{status\.type === "available" && `.*? \$\{status\.count\} rooms available`\}/g, '{status.type === "available" && `✅ ${status.count} rooms available`}');
content = content.replace(/\{status\.type === "days" && `.*? Fully booked for next \$\{status\.count\} days`\}/g, '{status.type === "days" && `❌ Fully booked for next ${status.count} days`}');
content = content.replace(/\{status\.type === "week" && `.*? No rooms available this week`\}/g, '{status.type === "week" && `❌ No rooms available this week`}');
content = content.replace(/\{status\.type === "full" && `.*? Fully booked today`\}/g, '{status.type === "full" && `❌ Fully booked today`}');

content = content.replace(/<h1 style=\{\{ marginTop: "40px" \}\}>.*? Fun & Tourism Activities<\/h1>/g, '<h1 style={{ marginTop: "40px" }}>🎢 Fun & Tourism Activities</h1>');

content = content.replace(/<p>.*? \{act\.location\} \| .*? \{act\.duration\}<\/p>/g, '<p>📍 {act.location} | ⏳ {act.duration}</p>');
content = content.replace(/<p className="price">.*? \{act\.price\}<\/p>/g, '<p className="price">₹ {act.price}</p>');
content = content.replace(/[^\n]*? \{reviewMap\[act\._id\]\.avgRating\} \/ 5/g, '\t\t\t\t\t\t\t\t\t\t\t\t⭐ {reviewMap[act._id].avgRating} / 5');

content = content.replace(/\{isSelected \? ".*? Added to Stay" : "Add to Stay"\}/g, '{isSelected ? "✅ Added to Stay" : "Add to Stay"}');

content = content.replace(/>\s*[^\n<>a-zA-Z0-9]\s*<\/button>/g, (match) => {
    if (content.indexOf(match) < content.indexOf('zoomImage')) {
        return '>❮</button>'; // First one is prev
    } else {
        return '>❯</button>'; // Second is next
    }
});

// Since the previous regex for buttons was a bit risky, let's target the exact lines 470-495 roughly:
content = content.replace(/className="nav-btn prev"\s*onClick=\{[^\}]+\}\s*>\s*.*?\s*<\/button>/g, `className="nav-btn prev"\n\t\t\t\t\t\t\t\t\t\t\tonClick={() =>\n\t\t\t\t\t\t\t\t\t\t\t\tsetCurrentImageIndex(prev =>\n\t\t\t\t\t\t\t\t\t\t\t\t\tprev === 0 ? currentItem.images.length - 1 : prev - 1\n\t\t\t\t\t\t\t\t\t\t\t\t)\n\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t\t\t❮\n\t\t\t\t\t\t\t\t\t\t</button>`);
content = content.replace(/className="nav-btn next"\s*onClick=\{[^\}]+\}\s*>\s*.*?\s*<\/button>/g, `className="nav-btn next"\n\t\t\t\t\t\t\t\t\t\t\tonClick={() =>\n\t\t\t\t\t\t\t\t\t\t\t\tsetCurrentImageIndex(prev =>\n\t\t\t\t\t\t\t\t\t\t\t\t\tprev === currentItem.images.length - 1 ? 0 : prev + 1\n\t\t\t\t\t\t\t\t\t\t\t\t)\n\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t\t\t❯\n\t\t\t\t\t\t\t\t\t\t</button>`);

content = content.replace(/\{\/\* .*? CHECK-IN \/ CHECK-OUT RESTORED \*\/\}/g, '{/* ✅ CHECK-IN / CHECK-OUT RESTORED */}');
content = content.replace(/<li key=\{act\._id\}>.*? \{act\.name\} \(\+.*?\{act\.price\}\)<\/li>/g, '<li key={act._id}>✅ {act.name} (+₹{act.price})</li>');
content = content.replace(/<h2>.*? Booking Successful!<\/h2>/g, '<h2>🎉 Booking Successful!</h2>');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed encoding with regex in booking.jsx');
