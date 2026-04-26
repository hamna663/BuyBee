import re

path = r'c:\Users\Hamna\Desktop\web\buybee\app\admin\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace CardContent p-0 with overflow
# Matches: <CardContent className="p-0">
content = content.replace('<CardContent className="p-0">', '<CardContent className="p-0 overflow-x-auto no-scrollbar">')

# Replace Table with min-width Table (only if followed by TableHeader to be safe)
# We want to catch the main tables in the tabs.
content = content.replace('<Table>', '<Table className="min-w-[800px] md:min-w-full">')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
