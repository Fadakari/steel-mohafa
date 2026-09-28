import xml.etree.ElementTree as ET
import codecs
import re

# 1. Read and modify the SVG from Downloads
svg_path = r'C:\Users\ASUS\Downloads\svg\Logo06.svg'
tree = ET.parse(svg_path)
root = tree.getroot()

# Strip namespace
for elem in root.iter():
    if '}' in elem.tag:
        elem.tag = elem.tag.split('}', 1)[1]

paths = list(root.findall('.//path'))
# Keep only the first path (the main logo)
for p in paths[1:]:
    root.remove(p)

# Change fill color to currentColor
paths[0].attrib['fill'] = 'currentColor'
# Remove transform if we want it to scale nicely, but let's keep it to be safe, or just leave it.
# Actually, the user's logo has a large viewBox. We can just add standard classes to the svg root.
root.attrib['class'] = "w-5 h-5 text-white"

# If viewBox is missing, we can add it based on width/height
if 'viewBox' not in root.attrib and 'width' in root.attrib and 'height' in root.attrib:
    root.attrib['viewBox'] = f"0 0 {root.attrib['width']} {root.attrib['height']}"

# Convert back to string
modified_svg_str = ET.tostring(root, encoding='unicode', method='xml')

# Remove the xml namespace stuff that etree might add
modified_svg_str = re.sub(r' xmlns:.*?\".*?\"', '', modified_svg_str)
modified_svg_str = modified_svg_str.replace('ns0:', '').replace(':ns0', '')

# 2. Inject into SiteFooter.vue
footer_path = 'app/components/SiteFooter.vue'
with codecs.open(footer_path, 'r', 'utf-8') as f:
    footer_content = f.read()

# The current generic bale svg in the file is this:
old_svg_pattern = r'<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6\.48 2 2 6\.03 2 11c0 2\.87 1\.48 5\.43 3\.82 7\.15.*?z"/></svg>'

footer_content = re.sub(old_svg_pattern, modified_svg_str, footer_content)

with codecs.open(footer_path, 'w', 'utf-8') as f:
    f.write(footer_content)

print("Successfully replaced SVG in SiteFooter.vue")
