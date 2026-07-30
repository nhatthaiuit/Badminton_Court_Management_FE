import re

with open('src/components/bookings/SharedScheduleGrid.jsx', 'r') as f:
    content = f.read()

# 1. Move border-b from flex row to children
content = re.sub(
    r'<div key={court.court_id} className="flex border-b border-gray-300 group hover:bg-gray-50 transition-colors">',
    r'<div key={court.court_id} className="flex group hover:bg-gray-50 transition-colors">',
    content
)

content = re.sub(
    r'<div className="w-32 flex-shrink-0 border-r border-gray-300 p-4 bg-white group-hover:bg-gray-50 sticky left-0 z-20 font-medium text-gray-800">',
    r'<div className="w-32 flex-shrink-0 border-r border-b border-gray-300 p-4 bg-white group-hover:bg-gray-50 sticky left-0 z-20 font-medium text-gray-800">',
    content
)

content = re.sub(
    r'<div className="flex-1 relative h-16 cursor-crosshair">',
    r'<div className="flex-1 relative h-16 cursor-crosshair border-b border-gray-300">',
    content
)

# 2. Fix opacity issue on isPast cells
content = re.sub(
    r"'bg-gray-100 cursor-not-allowed bg-pattern-diagonal opacity-60'",
    r"'bg-gray-50 cursor-not-allowed bg-pattern-diagonal'",
    content
)

with open('src/components/bookings/SharedScheduleGrid.jsx', 'w') as f:
    f.write(content)

