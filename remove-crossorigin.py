import codecs

with codecs.open('app/pages/blog/index.vue', 'r', 'utf-8') as f:
    content = f.read()

content = content.replace('crossorigin="anonymous"', '')

with codecs.open('app/pages/blog/index.vue', 'w', 'utf-8') as f:
    f.write(content)
