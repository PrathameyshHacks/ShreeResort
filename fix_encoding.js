const fs = require('fs');
const file = 'C:/Users/HP/Desktop/MP/ShreeResort/frontend/src/pages/booking.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace corrupted strings with correct ones
content = content.replace(/â Œ Booking failed/g, '❌ Booking failed');
content = content.replace(/ðŸ› ï¸  Book Your Stay/g, '🛏️ Book Your Stay');
content = content.replace(/â‚¹ {room\.price}/g, '₹ {room.price}');
content = content.replace(/â­  ROOM RATING/g, '⭐ ROOM RATING');
content = content.replace(/â­  {reviewMap/g, '⭐ {reviewMap');
content = content.replace(/ðŸ”¥ AVAILABILITY STATUS/g, '🔥 AVAILABILITY STATUS');
content = content.replace(/âœ… \$\{status\.count\}/g, '✅ ${status.count}');
content = content.replace(/â Œ Fully booked/g, '❌ Fully booked');
content = content.replace(/â Œ No rooms/g, '❌ No rooms');
content = content.replace(/ðŸŽ¢ Fun & Tourism Activities/g, '🎢 Fun & Tourism Activities');
content = content.replace(/ðŸ“  {act\.location} \| â ³ {act\.duration}/g, '📍 {act.location} | ⏳ {act.duration}');
content = content.replace(/â‚¹ {act\.price}/g, '₹ {act.price}');
content = content.replace(/u2b50 {reviewMap/g, '⭐ {reviewMap');
content = content.replace(/âœ… Added to Stay/g, '✅ Added to Stay');
content = content.replace(/>\s*â ®\s*<\/button>/g, '>❮</button>');
content = content.replace(/>\s*â ¯\s*<\/button>/g, '>❯</button>');
content = content.replace(/âœ… CHECK-IN/g, '✅ CHECK-IN');
content = content.replace(/âœ… {act\.name} \(\+â‚¹{act\.price}\)/g, '✅ {act.name} (+₹{act.price})');
content = content.replace(/ðŸŽ‰ Booking Successful!/g, '🎉 Booking Successful!');

// Fix button logic
const oldBtn = `<button
										disabled={status.type !== "available"}
										onClick={() => {
											setSelectedRoom(room);
											setSelectedActivity(null); // reset activity
											setCurrentImageIndex(0);
											setShowImageModal(true);
										}}
									>`;

const newBtn = `<button
										disabled={status.type !== "available"}
										onClick={() => {
											setSelectedRoom(room);
											setIsModalOpen(true);
										}}
									>`;
content = content.replace(oldBtn, newBtn);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed encoding and button logic in booking.jsx');
