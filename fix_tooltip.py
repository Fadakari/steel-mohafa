import codecs

content = codecs.open('app/components/PricingTable.vue', 'r', 'utf-8').read()

old_tooltip_class = 'class="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-2xl transition-all duration-200 z-50 pointer-events-none"'
new_tooltip_class = 'class="absolute bottom-full mb-3 w-64 bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-2xl transition-all duration-200 z-50 pointer-events-none"'

old_active_class = ':class="activeTooltipIndex === idx ? \'opacity-100 visible translate-y-0\' : \'opacity-0 invisible translate-y-2\'"'
new_active_class = ':class="[activeTooltipIndex === idx ? \'opacity-100 visible translate-y-0\' : \'opacity-0 invisible translate-y-2\', idx === 0 ? \'left-0 -translate-x-3 origin-bottom-left\' : idx === (chartDataset.length - 1 || 1) ? \'right-0 translate-x-3 origin-bottom-right\' : \'left-1/2 -translate-x-1/2 origin-bottom\']"'

old_arrow = 'class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900 border-b border-r border-zinc-700 rotate-45"'
new_arrow = 'class="absolute -bottom-1.5 w-3 h-3 bg-zinc-900 border-b border-r border-zinc-700 rotate-45"\n                       :class="[idx === 0 ? \'left-5\' : idx === (chartDataset.length - 1 || 1) ? \'right-5\' : \'left-1/2 -translate-x-1/2\']"'

if old_tooltip_class in content and old_active_class in content and old_arrow in content:
    content = content.replace(old_tooltip_class, new_tooltip_class)
    content = content.replace(old_active_class, new_active_class)
    content = content.replace(old_arrow, new_arrow)

    with codecs.open('app/components/PricingTable.vue', 'w', 'utf-8') as f:
        f.write(content)
    print("Replaced!")
else:
    print("Could not find the text to replace.")
