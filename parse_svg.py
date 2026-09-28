import xml.etree.ElementTree as ET
try:
    tree = ET.parse(r'C:\Users\ASUS\Downloads\svg\Logo06.svg')
    root = tree.getroot()
    for elem in root.iter():
        if '}' in elem.tag:
            elem.tag = elem.tag.split('}', 1)[1]
    
    def print_tree(node, level=0):
        attrs = ' '.join(f'{k}="{v}"' for k,v in node.attrib.items() if k not in ['d'])
        print('  '*level + f'<{node.tag} {attrs}>')
        for child in node:
            print_tree(child, level+1)

    print_tree(root)
except Exception as e:
    print(e)
