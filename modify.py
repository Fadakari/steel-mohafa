import codecs
import re

with codecs.open('app/components/SiteFooter.vue', 'r', 'utf-8') as f:
    content = f.read()

content = content.replace('rel="noopener noreferrer"', 'rel="nofollow noopener noreferrer"')
# also replace any existing nofollow noopener noreferrer to avoid duplicates if ran twice
content = content.replace('rel="nofollow nofollow noopener noreferrer"', 'rel="nofollow noopener noreferrer"')

pattern = r'<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M11\.944 0.*?z"/></svg>'
bale_svg = '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.87 1.48 5.43 3.82 7.15-.36 1.76-1.55 3.03-1.63 3.12-.13.14-.15.35-.06.5.09.16.27.25.46.23 2.58-.29 4.35-1.52 5.34-2.31C10.59 19.89 11.29 20 12 20c5.52 0 10-4.03 10-9s-4.48-9-10-9zm-2.5 7.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm5 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-5 5.5c.8-1.07 2.05-1.5 2.5-1.5s1.7.43 2.5 1.5c.16.21.12.52-.09.68-.21.16-.52.12-.68-.09-.58-.78-1.32-1.09-1.73-1.09s-1.15.31-1.73 1.09c-.16.21-.47.25-.68.09-.21-.16-.25-.47-.09-.68z"/></svg>'

content = re.sub(pattern, bale_svg, content)

with codecs.open('app/components/SiteFooter.vue', 'w', 'utf-8') as f:
    f.write(content)
